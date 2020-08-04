# Jellyfish UI Components

This module is a collection of re-usable React component that Jellyfish uses to build all its official user interfaces.

# Usage

Below is an example how to use this library:

```js
import Link from '@balena/jellyfish-ui-components/lib/Link'

const RENDERERS = {
	name: (name, item) => {
		return <Link append={item.slug || item.id}>{name}</Link>
	}
}
```
