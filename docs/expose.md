# Expose

Storybook autodocs takes the following definition:

```typescript
const visible = ref(false);
const close = () => visible.value = false;
const open = () => visible.value = true;

defineExpose({
  open,
  close,
  visible,
})

```
Inline definitions in expose object are not infered:
```typescript
defineExpose({
  open: () => visible.value = false; <-- won't be documented.
});
```
![expose](./expose.png){width=350px}
