export function getApiErrorMessage(error: unknown, fallback: string): string {
  const status = typeof error === "object" && error !== null && "response" in error
    ? (error as { response?: { status?: number } }).response?.status
    : undefined

  if (typeof error === "object" && error !== null && "response" in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } }).response
    const detail = response?.data?.detail
    if (typeof detail === "string" && detail.trim()) {
      return normalizeMessage(detail, status)
    }
  }

  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message
    if (typeof message === "string" && message.trim()) {
      return normalizeMessage(message, status)
    }
  }

  return fallback
}

function normalizeMessage(message: string, status?: number): string {
  const text = message.trim()
  const lower = text.toLowerCase()

  if (status === 401 || text.includes("请先登录") || text.includes("登录状态无效")) {
    return "登录状态已失效，请重新登录后再试。"
  }
  if (status === 402 || text.includes("生成额度不足")) {
    return "生成额度已用完，可继续查看和编辑历史项目。"
  }
  if (text.includes("LLM 配置缺失")) {
    return "生成服务配置不完整，请检查后端环境变量。"
  }
  if (text.includes("AI 返回的格式不合规") || text.includes("返回格式不合规")) {
    return "AI 返回内容不稳定，请重新生成一次。"
  }
  if (text.includes("LLM API 请求失败")) {
    return "AI 服务暂时不可用，请稍后重试。"
  }
  if (text.includes("自动保存失败")) {
    return "自动保存失败，请确认网络和登录状态后重试。"
  }
  if (lower.includes("failed to fetch") || lower.includes("network error")) {
    return "网络请求失败，请确认前后端服务已启动。"
  }
  if (lower.includes("invalid login credentials")) {
    return "邮箱或密码错误，请检查后重试。"
  }
  if (lower.includes("email not confirmed")) {
    return "邮箱尚未验证，请先完成邮箱验证。"
  }
  if (lower.includes("user already registered")) {
    return "该邮箱已注册，请直接登录。"
  }

  return text
}
