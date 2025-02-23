import { generateClient } from '@aws-amplify/api';
import { GraphQLQuery } from '@aws-amplify/api';
import { Content } from '../API'; // 型定義が自動生成される

const client = generateClient();

export const useContent = () => {
  const createContent = async (
    title: string, 
    content: string, 
    status: 'draft' | 'published' = 'draft'
  ) => {
    try {
      const now = new Date().toISOString(); // ISO 8601 UTC format: YYYY-MM-DDTHH:mm:ss.sssZ
      const result = await client.graphql({
        query: `
          mutation CreateContent($input: CreateContentInput!) {
            createContent(input: $input) {
              id
              title
              content
              status
              createdAt
            }
          }
        `,
        variables: {
          input: {
            title,
            content,
            status: status.toUpperCase(),
            createdAt: now
          }
        }
      });
      return result.data.createContent as Content;
    } catch (error) {
      console.error('Error creating content:', error);
      throw error;
    }
  };

  const updateContent = async (id: string, content: string, status: string) => {
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
            status,
            title: 'test title'
          }
        }
      });
      return result.data.updateContent as Content;
    } catch (error) {
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

  return {
    createContent,
    updateContent,
    getContent
  };
};