import { generateClient } from '@aws-amplify/api';
import { GraphQLQuery } from '@aws-amplify/api';
import { Content } from '../API'; // 型定義が自動生成される

const client = generateClient();

export const useContent = () => {
  const createContent = async (title: string, content: string) => {
    try {
      const result = await client.graphql({
        query: `
          mutation CreateContent($input: CreateContentInput!) {
            createContent(input: $input) {
              id
              title
              content
              status
              createdAt
              updatedAt
            }
          }
        `,
        variables: {
          input: {
            title: 'test title',
            content,
            status: 'PUBLISHED'
          }
        }
      });
      return result.data.createContent as Content;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  };

  const updateContent = async (id: string, content: string) => {
    try {
      const result = await client.graphql({
        query: `
          mutation UpdateContent($input: UpdateContentInput!) {
            updateContent(input: $input) {
              id
              title
              content
              status
              updatedAt
            }
          }
        `,
        variables: {
          input: {
            id,
            content,
            title: 'test title'  // titleは必須フィールドなので追加
          }
        }
      });
      console.log('Update result:', result); // 成功時のレスポンスを確認
      return result.data.updateContent as Content;
    } catch (error) {
      // エラーの詳細を表示
      console.error('Detailed error:', JSON.stringify(error, null, 2));
      throw error;
    }
  };

  const getContent = async (id: string) => {
    try {
      const result = await client.graphql({
        query: `
          query GetContent($id: ID!) {
            getContent(id: $id) {
              id
              title
              content
              status
              createdAt
              updatedAt
            }
          }
        `,
        variables: { id }
      });
      return result.data.getContent as Content;
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  };

  const listContents = async () => {
    try {
      const result = await client.graphql({
        query: `
          query ListContents {
            listContents {
              items {
                id
                title
                content
                status
                createdAt
                updatedAt
              }
            }
          }
        `
      });
      return result.data.listContents.items as Content[];
    } catch (error) {
      console.error('Error listing contents:', error);
      throw error;
    }
  };

  return {
    createContent,
    updateContent,
    getContent,
    listContents
  };
};