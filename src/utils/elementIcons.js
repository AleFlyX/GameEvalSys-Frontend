import {
  Avatar,
  Check,
  Checked,
  Clock,
  Collection,
  DataAnalysis,
  Document,
  Edit,
  Failed,
  FolderOpened,
  Management,
  Plus,
  Setting,
  TrendCharts,
  User,
  UserFilled,
} from "@element-plus/icons-vue";

export const elementIconMap = {
  Avatar,
  Check,
  Checked,
  Clock,
  Collection,
  DataAnalysis,
  Document,
  Edit,
  Failed,
  FolderOpened,
  Management,
  Plus,
  Setting,
  TrendCharts,
  User,
  UserFilled,
  Users: UserFilled,
};

export function getElementIcon(iconName, fallback = User) {
  return elementIconMap[iconName] || fallback;
}
