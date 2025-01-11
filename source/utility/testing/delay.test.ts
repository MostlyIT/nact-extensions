/**
 * Start a {@link Promise} that resolves after the supplied {@link duration}.
 *
 * @param duration Duration, in milliseconds, of the created {@link Promise}.
 * @returns The {@link Promise}.
 */
export const delay = (duration: number): Promise<void> =>
  new Promise<void>((resolve) => setTimeout(resolve, duration));
