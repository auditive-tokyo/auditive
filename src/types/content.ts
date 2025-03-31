export interface Content {
  id: string;
  title: string;
  content?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentProps {
  id: string;  //常に "pageOrder" などの固定値
  defaultPageId: String
  menuOrder: [String]
}