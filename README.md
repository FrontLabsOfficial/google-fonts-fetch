## @frontlabs/google-fonts-fetch

### Description
`@frontlabs/google-fonts-fetch` is a lightweight and efficient package designed to simplify the process of self-host Google Fonts. By leveraging this package, developers can effortlessly download Google Fonts to their local environment, enabling seamless integration and improved website performance.

## Motivation
While working on improving PageSpeed, I discovered the significant enhancements brought by Google Fonts v2. Everything seemed to become smoother and lighter, from font sizes to the ability to reuse various font weights. Despite my efforts to find a suitable API or package for immediate use, I came up empty-handed.

For instance, take the font Roboto. The font sizes of version 1 compared to version 2 were ~130kb and ~11kb respectively. Different font weights could be utilized within a single file. The savings were substantial, sparking a strong inspiration within me to create this package. It's evident that this project has the potential to make a substantial impact on metrics such as FCP, LCP, and overall PageSpeed scores, significantly benefiting your website.

This project aims to harness the efficiencies of Google Fonts v2, offering a streamlined solution for integrating fonts into web projects. By optimizing font usage, we can enhance website performance and user experience, ultimately leading to improved rankings and user engagement.

### Features
- **Effortless Font Download**: Quickly fetch and download Google Fonts to your local project directory with minimal configuration.

- **Customizable Options**: Customize font selection, variants, and subsets to tailor the download to your specific project needs.

- **Optimized Performance**: Reduce page load times and enhance website performance by serving fonts directly from your server.

## Installation
  ```bash
  npm install @frontlabs/google-fonts-fetch
  ```

## Usage
### Create Google Fonts Fetch
```js
import { createGoogleFontsFetch } from '@frontlabs/google-fonts-fetch'
const fetch = createGoogleFontsFetch({
  base: 'https://test.com',
  metadata: {
    name: 'metadata.json',
    override: false,
    outputPath: path.resolve('.output/metadata'),
  },
  outputPath: path.resolve('.output'),
  css: {
    write: true,
    combie: true,
  },
  font: {
    outputPath: path.resolve('.output/fonts'),
  },
})
```
### Download single font
```js
fetch.single('Roboto')
fetch.single('Roboto', { weight: [400] })
```

### Download multiple fonts
```js
fetch.multiple([
  { name: 'Roboto' },
  { name: 'Open Sans' },
])

fetch.multiple([
  { name: 'Roboto', weight: [400] },
  { name: 'Open Sans', weight: [400, 500] },
])
```

### Download all fonts
```js
helper.all()
```

## Contributing

Contributions are welcome! If you find any issues or have suggestions for improvements, please open an issue or submit a pull request.

## License

This project is licensed under the [MIT License](LICENSE).
