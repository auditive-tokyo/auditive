import { useState, useEffect, useCallback } from "react";
import { client } from "@/lib/amplify";
import { SiteConfig } from "@/types";

interface UpdateSiteConfigVariables {
  id: string;
  defaultPageId?: string;
  menuOrder?: string[];
}

export const useSiteSettings = () => {
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [siteConfig, setSiteConfig] = useState<SiteConfig | null>(null);
  const [defaultPageId, setDefaultPageId] = useState<string | null>(null); // nullで開始

  // サイト設定を更新する（内部用）
  const updateSiteConfigInternal = useCallback(
    async (id: string, newDefaultPageId?: string, newMenuOrder?: string[]) => {
      const variables: UpdateSiteConfigVariables = { id };

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
        variables,
      });

      if ("data" in result && result.data.updateSiteConfig) {
        setSiteConfig(result.data.updateSiteConfig);

        if (newDefaultPageId !== undefined) {
          setDefaultPageId(newDefaultPageId);
        }
      }

      return result;
    },
    [],
  );

  // サイト設定を取得する
  const fetchSiteConfig = useCallback(async () => {
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
        `,
      });

      if ("data" in result && result.data.getSiteConfig) {
        setSiteConfig(result.data.getSiteConfig);

        if (result.data.getSiteConfig.defaultPageId) {
          setDefaultPageId(result.data.getSiteConfig.defaultPageId);
        }
      }
    } catch (error) {
      console.error("Error fetching site config:", error);
      // エラー時は初期設定を作成
      try {
        await updateSiteConfigInternal("siteConfig", "contact", []);
      } catch (createError) {
        console.error("Error creating initial site config:", createError);
      }
    } finally {
      setIsLoading(false);
    }
  }, [updateSiteConfigInternal]);

  // ページ読み込み時にサイト設定を取得
  useEffect(() => {
    fetchSiteConfig();
  }, [fetchSiteConfig]);

  // サイト設定を更新する（外部API用）
  const updateSiteConfig = useCallback(
    async (id: string, newDefaultPageId?: string, newMenuOrder?: string[]) => {
      try {
        await updateSiteConfigInternal(id, newDefaultPageId, newMenuOrder);
        return true;
      } catch (error) {
        console.error("Error updating site config:", error);
        return false;
      }
    },
    [updateSiteConfigInternal],
  );

  // デフォルトページIDを設定する
  const setDefaultPage = useCallback(
    async (pageId: string) => {
      return await updateSiteConfig("siteConfig", pageId);
    },
    [updateSiteConfig],
  );

  // メニュー順序を設定する
  const setMenuOrder = useCallback(
    async (menuOrder: string[]) => {
      return await updateSiteConfig("siteConfig", undefined, menuOrder);
    },
    [updateSiteConfig],
  );

  return {
    isLoading,
    defaultPageId,
    menuOrder: siteConfig?.menuOrder || [],
    setDefaultPage,
    setMenuOrder,
  };
};
