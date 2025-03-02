import { generateClient } from '@aws-amplify/api';
import { Content } from '../types/content';

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
      
      // Type guard to ensure result has data property
      if ('data' in result) {
        return result.data.createContent as Content;
      }
      
      throw new Error('Invalid GraphQL result format');
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

      // Type guard to ensure result has data property
      if ('data' in result) {
        return result.data.updateContent as Content;
      }

      throw new Error('Invalid GraphQL result format');
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

      // Type guard to ensure result has data property
      if ('data' in result) {
        return result.data.getContent as Content;
      }

      throw new Error('Invalid GraphQL result format');
    } catch (error) {
      console.error('Error fetching content:', error);
      throw error;
    }
  };

  const getAllContents = async () => {
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

      // Type guard to ensure result has data property
      if ('data' in result) {
        return result.data.listContents.items as Content[];
      }

      throw new Error('Invalid GraphQL result format');
    } catch (error) {
      console.error('Error fetching contents:', error);
      throw error;
    }
  };

  const deleteContent = async (id: string) => {
    try {
      const result = await client.graphql({
        query: `
          mutation DeleteContent($input: DeleteContentInput!) {
            deleteContent(input: $input) {
              id
            }
          }
        `,
        variables: {
          input: {
            id
          }
        }
      });

      // Type guard to ensure result has data property
      if ('data' in result) {
        return result.data.deleteContent.id;
      }

      throw new Error('Invalid GraphQL result format');
    } catch (error) {
      console.error('Error deleting content:', error);
      throw error;
    }
  };

  return {
    createContent,
    updateContent,
    getContent,
    getAllContents,
    deleteContent // Add this to the returned object
  };
};