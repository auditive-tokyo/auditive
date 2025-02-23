import { Schema } from '@aws-amplify/core';

export const schema: Schema = {
  models: {
    Content: {
      fields: {
        id: { type: 'ID', required: true },
        title: { type: 'String', required: true },
        content: { type: 'String', required: true },
        status: { 
          type: 'String', 
          required: true,
          enum: ['DRAFT', 'PUBLISHED']
        },
        createdAt: { type: 'AWSDateTime' },
        updatedAt: { type: 'AWSDateTime' }
      },
      authorization: {
        rules: [
          { allow: 'public', operations: ['read'] },
          { allow: 'private', operations: ['create', 'update', 'delete'] }
        ]
      }
    }
  }
};