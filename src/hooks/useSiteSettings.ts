import { useState, useEffect } from 'react';
import { client } from '../lib/amplify';
import { SiteConfig } from '../types/content';

export const useSiteSettings = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [defaultPageId, setDefaultPageId] = useState<string>('contact'); // 初期値

  // ページ読み込み時にサイト設定を取得
  useEffect(() => {
    fetchSiteConfig();
  }, []);

  // サイト設定を取得する
  const fetchSiteConfig = async () => {
    setIsLoading(true);
    try {
      const result = await client.graphql({
        query: `
          query GetSiteConfig {
            getSiteConfig(id: "siteConfig") {
              id
              defaultPageId
              menuOrder
            }
          }
        `
      });

      if ('data' in result && result.data.getSiteConfig) {
        setSiteConfig(result.data.getSiteConfig);
        
        // デフォルトページIDを状態に設定
        if (result.data.getSiteConfig.defaultPageId) {
          setDefaultPageId(result.data.getSiteConfig.defaultPageId);
        }
      }
    } catch (error) {
      console.error('Error fetching site config:', error);
      // エラー時は初期設定を作成
      createInitialSiteConfig();
    } finally {
      setIsLoading(false);
    }
  };

  // 初期サイト設定を作成
  const createInitialSiteConfig = async () => {
    try {
      await updateSiteConfig('siteConfig', 'contact', []);
      await fetchSiteConfig(); // 再取得
    } catch (error) {
      console.error('Error creating initial site config:', error);
    }
  };

  // サイト設定を更新する
  const updateSiteConfig = async (id: string, newDefaultPageId?: string, newMenuOrder?: string[]) => {
    try {
      const variables: any = { id };
      
      if (newDefaultPageId !== undefined) {
        variables.defaultPageId = newDefaultPageId;
      }
      
      if (newMenuOrder !== undefined) {
        variables.menuOrder = newMenuOrder;
      }
      
      const result = await client.graphql({
        query: `
          mutation UpdateSiteConfig($id: ID!, $defaultPageId: String, $menuOrder: [String]) {
            updateSiteConfig(id: $id, defaultPageId: $defaultPageId, menuOrder: $menuOrder) {
              id
              defaultPageId
              menuOrder
            }
          }
        `,
        variables
      });

      if ('data' in result && result.data.updateSiteConfig) {
        setSiteConfig(result.data.updateSiteConfig);
        
        // デフォルトページIDを更新した場合は状態も更新
        if (newDefaultPageId !== undefined) {
          setDefaultPageId(newDefaultPageId);
        }
      }
      
      return true;
    } catch (error) {
      console.error('Error updating site config:', error);
      return false;
    }
  };

  // デフォルトページIDを設定する
  const setDefaultPage = async (pageId: string) => {
    return await updateSiteConfig('siteConfig', pageId);
  };

  // メニュー順序を設定する
  const setMenuOrder = async (menuOrder: string[]) => {
    return await updateSiteConfig('siteConfig', undefined, menuOrder);
  };

  return {
    isLoading,
    defaultPageId,
    menuOrder: siteConfig?.menuOrder || [],
    setDefaultPage,
    setMenuOrder,
  };
};