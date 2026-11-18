/**
 * Subscriber check for locked chapters.
 *
 * v1 has no accounts and no live payments, so this always returns false.
 * Locked chapter text and panel art are never sent to the browser.
 * When Cipher CTS turns on subscriptions, replace the body of this function
 * with a real session check. The private-source loader does not need to change.
 */
export async function isSubscriber(): Promise<boolean> {
  return false;
}
