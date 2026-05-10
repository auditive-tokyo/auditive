from aws_cdk import (
    aws_appsync as appsync,
    aws_cognito as cognito,
    aws_dynamodb as dynamodb,
    aws_iam as iam,
    aws_lambda as aws_lambda,
    Stack,
    RemovalPolicy,
    CfnOutput,
)
from constructs import Construct

UPDATE_CONTENT_REQUEST_VTL = """{
  "version": "2017-02-28",
  "operation": "UpdateItem",
  "key": {
    "id": $util.dynamodb.toDynamoDBJson($ctx.args.input.id)
  },
  "update": {
    "expression": "SET #title = :title, #content = :content, #status = :status, #updatedAt = :updatedAt",
    "expressionNames": {
      "#title": "title",
      "#content": "content",
      "#status": "status",
      "#updatedAt": "updatedAt"
    },
    "expressionValues": {
      ":title": $util.dynamodb.toDynamoDBJson($util.defaultIfNull($ctx.args.input.title, "")),
      ":content": $util.dynamodb.toDynamoDBJson($util.defaultIfNull($ctx.args.input.content, "")),
      ":status": $util.dynamodb.toDynamoDBJson($util.defaultIfNull($ctx.args.input.status, "DRAFT")),
      ":updatedAt": $util.dynamodb.toDynamoDBJson($util.defaultIfNull($ctx.args.input.updatedAt, $util.time.nowISO8601()))
    }
  }
}"""

UPDATE_SITE_CONFIG_REQUEST_VTL = """#if($util.isNull($ctx.args.defaultPageId) && $util.isNull($ctx.args.menuOrder))
  {
    "version": "2017-02-28",
    "operation": "UpdateItem",
    "key": {
      "id": $util.dynamodb.toDynamoDBJson($ctx.args.id)
    },
    "update": {
      "expression": "SET #dummy = :dummy",
      "expressionNames": {"#dummy": "dummy"},
      "expressionValues": {":dummy": $util.dynamodb.toDynamoDBJson("dummy")}
    }
  }
#elseif($util.isNull($ctx.args.defaultPageId))
  {
    "version": "2017-02-28",
    "operation": "UpdateItem",
    "key": {
      "id": $util.dynamodb.toDynamoDBJson($ctx.args.id)
    },
    "update": {
      "expression": "SET #menuOrder = :menuOrder",
      "expressionNames": {"#menuOrder": "menuOrder"},
      "expressionValues": {":menuOrder": $util.dynamodb.toDynamoDBJson($ctx.args.menuOrder)}
    }
  }
#elseif($util.isNull($ctx.args.menuOrder))
  {
    "version": "2017-02-28",
    "operation": "UpdateItem",
    "key": {
      "id": $util.dynamodb.toDynamoDBJson($ctx.args.id)
    },
    "update": {
      "expression": "SET #defaultPageId = :defaultPageId",
      "expressionNames": {"#defaultPageId": "defaultPageId"},
      "expressionValues": {":defaultPageId": $util.dynamodb.toDynamoDBJson($ctx.args.defaultPageId)}
    }
  }
#else
  {
    "version": "2017-02-28",
    "operation": "UpdateItem",
    "key": {
      "id": $util.dynamodb.toDynamoDBJson($ctx.args.id)
    },
    "update": {
      "expression": "SET #defaultPageId = :defaultPageId, #menuOrder = :menuOrder",
      "expressionNames": {
        "#defaultPageId": "defaultPageId",
        "#menuOrder": "menuOrder"
      },
      "expressionValues": {
        ":defaultPageId": $util.dynamodb.toDynamoDBJson($ctx.args.defaultPageId),
        ":menuOrder": $util.dynamodb.toDynamoDBJson($ctx.args.menuOrder)
      }
    }
  }
#end"""

LIST_CONTENTS_RESPONSE_VTL = """{
  "items": $util.toJson($ctx.result.items),
  "nextToken": $util.toJson($ctx.result.nextToken)
}"""


class AppSyncStack(Stack):
    def __init__(
        self,
        scope: Construct,
        construct_id: str,
        contact_form_fn: aws_lambda.IFunction,
        **kwargs,
    ) -> None:
        super().__init__(scope, construct_id, **kwargs)

        # ── DynamoDB Tables ─────────────────────────────────────────────────
        content_table = dynamodb.Table(
            self, "ContentTable",
            table_name="auditive-content-table",
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            partition_key=dynamodb.Attribute(
                name="id",
                type=dynamodb.AttributeType.STRING,
            ),
            removal_policy=RemovalPolicy.RETAIN,
        )
        content_table.node.default_child.override_logical_id("ContentTable")  # type: ignore[union-attr]

        site_config_table = dynamodb.Table(
            self, "SiteConfigTable",
            table_name="auditive-site-config",
            billing_mode=dynamodb.BillingMode.PAY_PER_REQUEST,
            partition_key=dynamodb.Attribute(
                name="id",
                type=dynamodb.AttributeType.STRING,
            ),
            removal_policy=RemovalPolicy.RETAIN,
        )
        site_config_table.node.default_child.override_logical_id("SiteConfigTable")  # type: ignore[union-attr]

        # ── AppSync API ──────────────────────────────────────────────────────
        api = appsync.GraphqlApi(
            self, "AuditiveAPI",
            name="AuditiveAPI",
            definition=appsync.Definition.from_schema(
                appsync.SchemaFile.from_asset("schema.graphql")
            ),
            authorization_config=appsync.AuthorizationConfig(
                default_authorization=appsync.AuthorizationMode(
                    authorization_type=appsync.AuthorizationType.IAM,
                )
            ),
        )
        # Preserve logical ID from existing SAM stack to keep the same API endpoint URL
        api.node.default_child.override_logical_id("AppSyncApi")  # type: ignore[union-attr]

        # ── DataSources ──────────────────────────────────────────────────────
        content_ds = api.add_dynamo_db_data_source("ContentTableDS", content_table)
        site_config_ds = api.add_dynamo_db_data_source("SiteConfigTableDS", site_config_table)

        contact_form_ds = api.add_lambda_data_source("ContactFormDS", contact_form_fn)

        # ── Resolvers ────────────────────────────────────────────────────────
        # getContent
        content_ds.create_resolver(
            "GetContentResolver",
            type_name="Query",
            field_name="getContent",
            request_mapping_template=appsync.MappingTemplate.dynamo_db_get_item("id", "id"),
            response_mapping_template=appsync.MappingTemplate.dynamo_db_result_item(),
        )

        # listContents
        content_ds.create_resolver(
            "ListContentsResolver",
            type_name="Query",
            field_name="listContents",
            request_mapping_template=appsync.MappingTemplate.dynamo_db_scan_table(),
            response_mapping_template=appsync.MappingTemplate.from_string(LIST_CONTENTS_RESPONSE_VTL),
        )

        # createContent
        content_ds.create_resolver(
            "CreateContentResolver",
            type_name="Mutation",
            field_name="createContent",
            request_mapping_template=appsync.MappingTemplate.dynamo_db_put_item(
                appsync.PrimaryKey.partition("id").auto(),
                appsync.Values.projecting("input"),
            ),
            response_mapping_template=appsync.MappingTemplate.dynamo_db_result_item(),
        )

        # updateContent
        content_ds.create_resolver(
            "UpdateContentResolver",
            type_name="Mutation",
            field_name="updateContent",
            request_mapping_template=appsync.MappingTemplate.from_string(UPDATE_CONTENT_REQUEST_VTL),
            response_mapping_template=appsync.MappingTemplate.dynamo_db_result_item(),
        )

        # deleteContent
        content_ds.create_resolver(
            "DeleteContentResolver",
            type_name="Mutation",
            field_name="deleteContent",
            request_mapping_template=appsync.MappingTemplate.dynamo_db_delete_item("id", "input.id"),
            response_mapping_template=appsync.MappingTemplate.dynamo_db_result_item(),
        )

        # getSiteConfig
        site_config_ds.create_resolver(
            "GetSiteConfigResolver",
            type_name="Query",
            field_name="getSiteConfig",
            request_mapping_template=appsync.MappingTemplate.dynamo_db_get_item("id", "id"),
            response_mapping_template=appsync.MappingTemplate.dynamo_db_result_item(),
        )

        # updateSiteConfig
        site_config_ds.create_resolver(
            "UpdateSiteConfigResolver",
            type_name="Mutation",
            field_name="updateSiteConfig",
            request_mapping_template=appsync.MappingTemplate.from_string(UPDATE_SITE_CONFIG_REQUEST_VTL),
            response_mapping_template=appsync.MappingTemplate.dynamo_db_result_item(),
        )

        # sendContactForm
        contact_form_ds.create_resolver(
            "SendContactFormResolver",
            type_name="Mutation",
            field_name="sendContactForm",
            request_mapping_template=appsync.MappingTemplate.lambda_request(),
            response_mapping_template=appsync.MappingTemplate.lambda_result(),
        )

        # ── Cognito Identity Pool ────────────────────────────────────────────
        identity_pool = cognito.CfnIdentityPool(
            self, "CognitoIdentityPool",
            identity_pool_name="AuditiveIdentityPool",
            allow_unauthenticated_identities=True,
        )

        unauth_role = iam.Role(
            self, "CognitoUnauthRole",
            role_name="AuditiveUnauthRole",
            assumed_by=iam.FederatedPrincipal(
                "cognito-identity.amazonaws.com",
                conditions={
                    "StringEquals": {
                        "cognito-identity.amazonaws.com:aud": identity_pool.ref
                    },
                    "ForAnyValue:StringLike": {
                        "cognito-identity.amazonaws.com:amr": "unauthenticated"
                    },
                },
                assume_role_action="sts:AssumeRoleWithWebIdentity",
            ),
        )
        unauth_role.node.default_child.override_logical_id("CognitoUnauthRole")  # type: ignore[union-attr]

        unauth_role.add_to_policy(
            iam.PolicyStatement(
                effect=iam.Effect.ALLOW,
                actions=["appsync:GraphQL"],
                resources=[
                    f"{api.arn}/types/Query/*",
                    f"{api.arn}/types/Mutation/*",
                ],
            )
        )

        cognito.CfnIdentityPoolRoleAttachment(
            self, "IdentityPoolRoleAttachment",
            identity_pool_id=identity_pool.ref,
            roles={"unauthenticated": unauth_role.role_arn},
        )

        # ── Outputs ──────────────────────────────────────────────────────────
        CfnOutput(
            self, "ApiEndpoint",
            value=api.graphql_url,
            description="AppSync API Endpoint",
        )
        CfnOutput(
            self, "IdentityPoolId",
            value=identity_pool.ref,
            description="Cognito Identity Pool ID",
        )
        CfnOutput(
            self, "Region",
            value=Stack.of(self).region,
            description="AWS Region",
        )
