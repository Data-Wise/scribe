# Milkdown Editor Test Document

This document tests all features of the Milkdown editor with math and syntax highlighting.

## Math Rendering (KaTeX)

### Inline Math

The quadratic formula is $x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$ and Euler's identity is $e^{i\pi} + 1 = 0$.

### Display Math

$$
\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}
$$

### Complex Equations

$$
\begin{aligned}
\nabla \times \vec{\mathbf{B}} -\, \frac1c\, \frac{\partial\vec{\mathbf{E}}}{\partial t} &= \frac{4\pi}{c}\vec{\mathbf{j}} \\
\nabla \cdot \vec{\mathbf{E}} &= 4 \pi \rho \\
\nabla \times \vec{\mathbf{E}}\, +\, \frac1c\, \frac{\partial\vec{\mathbf{B}}}{\partial t} &= \vec{\mathbf{0}} \\
\nabla \cdot \vec{\mathbf{B}} &= 0
\end{aligned}
$$

## Code Syntax Highlighting (Prism)

### JavaScript

```javascript
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

console.log(fibonacci(10)); // 55
```

### Python

```python
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

print(quick_sort([3, 6, 8, 10, 1, 2, 1]))
```

### R

```r
# Linear regression example
set.seed(123)
x <- rnorm(100)
y <- 2 * x + rnorm(100, sd = 0.5)

model <- lm(y ~ x)
summary(model)

# Plot
plot(x, y, main = "Linear Regression")
abline(model, col = "red")
```

### TypeScript

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

function getUserById(users: User[], id: number): User | undefined {
  return users.find(user => user.id === id);
}

const users: User[] = [
  { id: 1, name: "Alice", email: "alice@example.com" },
  { id: 2, name: "Bob", email: "bob@example.com" }
];
```

## Markdown Elements

### Headings

# Heading 1
## Heading 2
### Heading 3
#### Heading 4
##### Heading 5
###### Heading 6

### Emphasis

This is **bold text** and this is *italic text*.

This is ***bold and italic*** together.

This is ~~strikethrough text~~.

### Lists

#### Unordered List

- First item
- Second item
  - Nested item
  - Another nested item
- Third item

#### Ordered List

1. First item
2. Second item
   1. Nested item
   2. Another nested item
3. Third item

#### Task List

- [x] Completed task
- [ ] Incomplete task
- [ ] Another task

### Links

[Link to Google](https://www.google.com)

### Blockquotes

> This is a blockquote.
>
> It can span multiple lines.
>
> — Anonymous

### Code

Inline code: `const x = 42;`

### Horizontal Rule

---

### Tables

| Header 1 | Header 2 | Header 3 |
|----------|----------|----------|
| Row 1    | Data     | More data |
| Row 2    | Value    | Another value |
| Row 3    | Item     | Final item |

## Advanced Markdown

### Nested Lists with Code

1. Install dependencies
   ```bash
   npm install
   ```

2. Run the development server
   ```bash
   npm run dev
   ```

3. Build for production
   ```bash
   npm run build
   ```

### Math in Lists

1. The area of a circle: $A = \pi r^2$
2. The volume of a sphere: $V = \frac{4}{3}\pi r^3$
3. The surface area of a sphere: $SA = 4\pi r^2$

### Mixed Content

Here's a complex example combining **bold text**, *italic text*, `inline code`, and math: $f(x) = x^2 + 2x + 1$.

```typescript
// TypeScript with math comment
// Area formula: A = πr²
function calculateCircleArea(radius: number): number {
  return Math.PI * radius ** 2;
}
```

## Test Results

This document tests:

- ✅ Inline math rendering ($...$)
- ✅ Display math rendering ($$...$$)
- ✅ Complex multi-line equations
- ✅ JavaScript syntax highlighting
- ✅ Python syntax highlighting
- ✅ R syntax highlighting
- ✅ TypeScript syntax highlighting
- ✅ All heading levels (H1-H6)
- ✅ Bold, italic, strikethrough
- ✅ Unordered lists
- ✅ Ordered lists
- ✅ Task lists (checkboxes)
- ✅ Links
- ✅ Blockquotes
- ✅ Inline code
- ✅ Horizontal rules
- ✅ Tables
- ✅ Nested lists with code blocks
- ✅ Math in lists
- ✅ Mixed content combinations
