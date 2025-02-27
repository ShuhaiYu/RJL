import AsyncSelect from "react-select/async";
import axios from "axios";
import { useAuthContext } from "@/auth";

/**
 * 用于搜索并选择用户
 * - 当输入为空时显示所有用户
 * - 当有输入时根据关键字搜索
 */
export default function AsyncUserSelect({ onChange, placeholder = "Select user..." }) {
  const { baseApi, auth } = useAuthContext();
  const token = auth?.accessToken;

  /**
   * loadOptions 是 react-select 的异步加载函数
   * 会在以下场景被调用：
   *  - 组件初次加载 (如果 defaultOptions=true)
   *  - 用户输入变化
   */
  const loadOptions = async (inputValue) => {
    try {
      // 如果输入框为空，则 search=""
      // 否则 search=inputValue
      const searchParam = inputValue?.trim() || "";

      const response = await axios.get(`${baseApi}/users`, {
        headers: { Authorization: `Bearer ${token}` },
        params: { search: searchParam }, // 传给后端
      });

      const users = response.data; // 假设返回一个数组 [{id, name, email}, ...]

      // 转成 { value, label } 格式
      return users.map((u) => ({
        value: u.id,
        label: u.name || u.email,
      }));
    } catch (err) {
      console.error("AsyncUserSelect loadOptions error:", err);
      return [];
    }
  };

  // 当选中某个选项时
  const handleChange = (selectedOption) => {
    if (onChange) {
      onChange(selectedOption || null);
    }
  };

  return (
    <AsyncSelect
      cacheOptions
      defaultOptions
      loadOptions={loadOptions}
      onChange={handleChange}
      placeholder={placeholder}
      // 如果需要搜索时立即触发
      menuPlacement='auto'
    />
  );
}
