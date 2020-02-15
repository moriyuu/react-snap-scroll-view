# react-snap-scroll-view

Scroll view component with snapping.

Demo: https://react-snap-scroll-view.netlify.com/

## Usage

```tsx
<SnapScrollView
  items={items.map(item => (
    <Item style={{ backgroundColor: item.color, width: item.width }} />
  ))}
  itemMarginHorizontalPx={16}
  snapToAlignment="center"
/>
```

### Props

```ts
type Props = {
  items: React.ReactElement[];
  itemMarginPx: number;
  snapToAlignment?: "center";
  direction?: "horizontal" | "vertical";
  onSnap?({ focusedIndex }: { focusedIndex: number }): void;
};
```

## TODO

- [ ] npm publish
- [ ] snapToAlignment
