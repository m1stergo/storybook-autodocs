# Installation

## Prerequisites
Node.js version 16 or higher.
Terminal for accessing VitePress via its command line interface (CLI).

Clone the repository
```bash
git clone https://github.com/m1stergo/storybook-autodocs
```

## 1. Autodocs execution
Before running the `storybook-autodocs` script, you need to create the story file for the components you want to document.
`storybook-autodocs` will search for all story files and check if there is a matching Vue component. If a match is found, it will parse the vue component and generate the documentation.

```
Button.vue
Button.stories.ts <- has match
Other.stories.ts <- no match
```

### Run the script
Open the command line at the `storybook-autodocs` folder and execute
```bash
node index.js dir=/the/path/to/your/story
```

The script will analize all matching vue component and update the storybook files as follow:

```javascript
// Button.stories.ts
import Button from "./Button";

/**
 * storybook-autodocs::begin
 * The following statements where created automatically, do not edit!
 * For more info see: https://github.com/m1stergo/storybook-autodocs
 **/
const argTypes = { ... };
/** storybook-autodocs::end **/
```

Done! `storybook-autodocs` will insert the argTypes in your story.
