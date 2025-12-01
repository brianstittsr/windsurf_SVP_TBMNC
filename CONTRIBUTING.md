# Contributing to TBMNC Tracker

Thank you for your interest in contributing to the TBMNC Customer Tracking System! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Guidelines](#testing-guidelines)

---

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in all interactions.

### Our Standards

- **Be respectful** of differing viewpoints and experiences
- **Accept constructive criticism** gracefully
- **Focus on what is best** for the community and project
- **Show empathy** towards other community members

---

## 🚀 Getting Started

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/windsurf_SVP_TBMNC.git
cd windsurf_SVP_TBMNC

# Add upstream remote
git remote add upstream https://github.com/brianstittsr/windsurf_SVP_TBMNC.git
```

### 2. Set Up Development Environment

```bash
# Install dependencies
npm install

# Copy environment files
cp .env.example .env
cp packages/frontend/.env.example packages/frontend/.env

# Start development servers
npm run dev
```

### 3. Create a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create a feature branch
git checkout -b feature/your-feature-name
```

---

## 💻 Development Workflow

### Branch Naming Convention

- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Adding or updating tests
- `chore/` - Maintenance tasks

**Examples:**
- `feature/add-document-upload`
- `fix/customer-validation-bug`
- `docs/update-api-guide`

### Development Process

1. **Write Code**
   ```bash
   # Make your changes
   # Test locally
   npm run dev
   ```

2. **Check Code Quality**
   ```bash
   # Lint code
   npm run lint
   
   # Format code
   npm run format
   
   # Type check
   npm run type-check
   ```

3. **Test Your Changes**
   ```bash
   # Run tests
   npm test
   
   # Test API endpoints
   curl http://localhost:3000/api/v1/customers
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: Add your feature description"
   ```

5. **Push to Your Fork**
   ```bash
   git push origin feature/your-feature-name
   ```

---

## 📝 Coding Standards

### TypeScript

- Use **TypeScript** for all new code
- Define **interfaces** for all data structures
- Avoid `any` type - use proper typing
- Use **async/await** instead of callbacks

**Example:**
```typescript
// ✅ Good
interface Customer {
  id: string;
  companyName: string;
  status: 'active' | 'inactive';
}

async function getCustomer(id: string): Promise<Customer> {
  const doc = await db.collection('customers').doc(id).get();
  return doc.data() as Customer;
}

// ❌ Bad
async function getCustomer(id: any) {
  const doc = await db.collection('customers').doc(id).get();
  return doc.data();
}
```

### Code Style

- **Indentation:** 2 spaces
- **Quotes:** Single quotes for strings
- **Semicolons:** Required
- **Line length:** Max 100 characters
- **Naming:**
  - `camelCase` for variables and functions
  - `PascalCase` for classes and interfaces
  - `UPPER_CASE` for constants

### File Organization

```
src/
├── controllers/    # Request handlers
├── services/       # Business logic
├── routes/         # API routes
├── middleware/     # Express middleware
├── utils/          # Helper functions
└── types/          # TypeScript types
```

### Comments

- Write **self-documenting code**
- Add comments for **complex logic**
- Use **JSDoc** for public APIs

```typescript
/**
 * Creates a new customer in Firestore
 * @param data - Customer data to create
 * @returns Created customer with ID
 */
async function createCustomer(data: CustomerData): Promise<Customer> {
  // Implementation
}
```

---

## 📦 Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Adding or updating tests
- `chore` - Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(customers): Add customer search functionality"

# Bug fix
git commit -m "fix(api): Fix validation error in customer creation"

# Documentation
git commit -m "docs(readme): Update installation instructions"

# With body
git commit -m "feat(analytics): Add pipeline metrics

- Add stage distribution calculation
- Add completion rate tracking
- Update dashboard endpoint"
```

### Rules

- Use **present tense** ("Add feature" not "Added feature")
- Use **imperative mood** ("Move cursor to..." not "Moves cursor to...")
- First line should be **50 characters or less**
- Reference issues and PRs in footer

---

## 🔄 Pull Request Process

### Before Submitting

- [ ] Code follows project style guidelines
- [ ] All tests pass (`npm test`)
- [ ] Lint passes (`npm run lint`)
- [ ] Type check passes (`npm run type-check`)
- [ ] Documentation updated if needed
- [ ] Commit messages follow guidelines

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] Tested locally
- [ ] Added/updated tests
- [ ] All tests passing

## Screenshots (if applicable)
Add screenshots here

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No new warnings
```

### Review Process

1. **Submit PR** with clear description
2. **CI checks** must pass
3. **Code review** by maintainers
4. **Address feedback** if requested
5. **Approval** and merge

---

## 🧪 Testing Guidelines

### Unit Tests

```typescript
// Example test
describe('CustomerService', () => {
  it('should create a customer', async () => {
    const data = {
      companyName: 'Test Corp',
      contactEmail: 'test@example.com',
    };
    
    const customer = await customerService.createCustomer(data);
    
    expect(customer.id).toBeDefined();
    expect(customer.companyName).toBe('Test Corp');
  });
});
```

### API Tests

```bash
# Test endpoint
curl -X POST http://localhost:3000/api/v1/customers \
  -H "Content-Type: application/json" \
  -d '{"companyName":"Test Corp"}'
```

### Test Coverage

- Aim for **80%+ coverage**
- Test **happy paths** and **error cases**
- Test **edge cases** and **boundary conditions**

---

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
Clear description of the bug

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '...'
3. See error

**Expected behavior**
What you expected to happen

**Screenshots**
If applicable

**Environment:**
- OS: [e.g. Windows 11]
- Node version: [e.g. 20.10.0]
- Browser: [e.g. Chrome 120]
```

---

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
Clear description of the problem

**Describe the solution**
How you'd like it to work

**Describe alternatives**
Other solutions you've considered

**Additional context**
Any other context or screenshots
```

---

## 📚 Additional Resources

- [Quick Start Guide](QUICK_START.md)
- [API Testing Guide](API_TESTING.md)
- [Development Utilities](DEV_UTILITIES.md)
- [Firebase Setup](FIREBASE_SETUP.md)

---

## 🙏 Thank You!

Your contributions make this project better for everyone. We appreciate your time and effort!

---

**Questions?** Open an issue or contact the maintainers.
