export interface Review {
  readonly id: string;
  /** First name and last initial, like "Maren T." */
  readonly name: string;
  /** 1 to 5 */
  readonly stars: number;
  readonly text: string;
  /**
   * The day she wrote it, as yyyy-mm-dd. Optional only because reviews saved on a device before
   * dates existed do not have one; every review written now does.
   */
  readonly date?: string;
}
