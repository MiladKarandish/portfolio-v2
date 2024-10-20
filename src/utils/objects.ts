export const isObjectEmpty = (obj: object) => {
  return obj && Object.keys(obj).length <= 0;
};

// Remove duplicated object from array => best performance
export const removeDuplicates = <T>(array: T[], objectKey: string | number) =>
  Array.from(
    new Map(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      array.map((item) => [(item as any)[objectKey.toString()], item])
    ).values()
  );
