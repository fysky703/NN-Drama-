/** User-facing error messages. Never expose raw stack traces to users. */
export const ERROR_MESSAGES: Record<string, string> = {
  invalid_url: "That URL is not valid. Please check it and try again.",
  unreachable: "The website could not be reached. Check the address and try again.",
  blocked_bot: "The website blocked automated browsers. Try a different URL.",
  timeout: "The page took too long to load. Try again or pick a lighter page.",
  requires_auth: "The website requires authentication and cannot be scanned.",
  unsupported_content: "This content type is not supported.",
  ai_failed: "AI generation failed. Please retry or switch AI provider.",
  screenshot_failed: "We could not capture a screenshot of this page.",
  codegen_failed: "Code generation failed.",
  worker_unavailable: "The scanner worker is unavailable. Please try again shortly.",
  rate_limited: "You have reached the scan limit. Please wait and try again.",
  not_found: "We could not find that scan.",
  internal: "Something went wrong on our side. Please try again.",
};

export function userMessage(code: string): string {
  return ERROR_MESSAGES[code] ?? ERROR_MESSAGES.internal;
}
