import { DeepLinkOption, Option } from "./constants"

function createWebviewDeepLink(url: string, fixedTitle: string, headerVariant: string): string {
  return `stair-crusher://webview?url=${encodeURIComponent(url)}&fixedTitle=${encodeURIComponent(fixedTitle)}&headerVariant=${encodeURIComponent(headerVariant)}`
}

export function buildDeepLinkFromFormValues(formValues: { 
  deepLink?: DeepLinkOption
  deepLinkArgument?: string
  queryParams?: { [key: string]: string }
  customDeepLink?: string
  webviewUrl?: string
  webviewFixedTitle?: string
  webviewHeaderVariant?: Option
}): string | undefined {
  if (!formValues.deepLink || formValues.deepLink.value.length === 0) {
    return undefined
  }

  if (formValues.deepLink.value === "custom") {
    // Custom deep link
    if (!formValues.customDeepLink || formValues.customDeepLink.length === 0) {
      return undefined
    }
    return formValues.customDeepLink
  } else if (formValues.deepLink.value === "stair-crusher://search") {
    // Search deep link with query params
    const baseUrl = "stair-crusher://search"
    if (formValues.queryParams && Object.keys(formValues.queryParams).length > 0) {
      const queryString = new URLSearchParams(formValues.queryParams).toString()
      return `${baseUrl}?${queryString}`
    } else {
      return baseUrl
    }
  } else if (formValues.deepLink.value === "stair-crusher://webview") {
    // Validate webview fields
    if (!formValues.webviewUrl || !formValues.webviewFixedTitle || !formValues.webviewHeaderVariant) {
      return undefined
    }
    return createWebviewDeepLink(
      formValues.webviewUrl,
      formValues.webviewFixedTitle,
      formValues.webviewHeaderVariant.value,
    )
  } else if (formValues.deepLink.isArgumentRequired) {
    if (!formValues.deepLinkArgument || formValues.deepLinkArgument.length === 0) {
      return undefined
    } else {
      return `${formValues.deepLink.value}/${formValues.deepLinkArgument}`
    }
  } else {
    return formValues.deepLink.value
  }
}