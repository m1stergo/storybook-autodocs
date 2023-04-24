# Adding more details

## Description
You can add a description with JSDoc comments

```typescript
type Props = {
  /**
   * Adds an event listener to detects click outside the element
   * and closes the modal
   */
  closeOnclickOutside: boolean | { ignore: string[] | HTMLElement[] };
}
```

## @example
The @example tag at the end of your comment will be used for storybook details:
```typescript
type Props = {
  /**
   * Adds an event listener to detects click outside the element
   * and closes the modal
   * @example
   * You can pass an array of CssSelectors or HTMLElements to be ignored
   * {
   *  ignore: [".div-1", ".div-2"]
   * }
   */
  closeOnclickOutside: boolean;
}
```

## @param
The function params are infered to storybook details automatically, but if you want to provide your own details, you can define each param with the @param tag
```typescript
type Props = {
  /**
   * This function does something awesome
   * @param name - some description
   * @param status - some description
   */
  callback: (name: string, status: "active" | "inactive") => void;
}
```
