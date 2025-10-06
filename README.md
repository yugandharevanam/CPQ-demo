# Evanam CPQ Demo React Application
A modern Configure, Price, Quote (CPQ) application built with React, TypeScript, and Vite for elevator configuration and quotation management.

## 🚀 Features

- **Customer Management**: Create and manage customer information
- **Lift Configuration**: Multi-step lift planning with product selection
- **Real-time Quotation**: Generate quotations with pricing calculations
- **Frappe Integration**: Full integration with Frappe backend
- **Authentication**: OAuth2 authentication with token management
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Form Validation**: Comprehensive form validation with Zod
- **Dark/Light Theme**: Theme switching capability
- **Responsive Design**: Mobile-first responsive design

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────┐  ┌──────────────┐  ┌─────────────┐         │
│  │  Dashboard  │  │ Lift Planning│  │   Login     │         │
│  └─────────────┘  └──────────────┘  └─────────────┘         │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Components │  │   Contexts  │  │   Hooks     │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐          │
│  │  Services   │  │   API Layer │  │ Validation  │          │
│  └─────────────┘  └─────────────┘  └─────────────┘          │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    Frappe Backend                           │
├─────────────────────────────────────────────────────────────┤
│  Customer DocType | Quotation DocType | Item DocType        │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Project Structure

```
src/
├── api/                    # API configuration and clients
│   ├── axiosInstance.ts   # Axios setup with interceptors
│   ├── endpoints.ts       # API endpoint definitions
│   ├── frappe.ts         # Frappe API client
│   └── mockApi.ts        # Mock API for development
├── auth/                  # Authentication components
│   ├── ProtectedRoute.tsx
│   └── useAuth.ts
├── components/           # React components
│   ├── common/          # Shared components
│   ├── features/        # Feature-specific components
│   │   ├── customer/
│   │   ├── lift-plan/   # Lift planning forms
│   │   └── quotation/
│   ├── layout/          # Layout components
│   └── ui/              # shadcn/ui components
├── context/             # React contexts
│   ├── AuthContext.tsx
│   └── ThemeContext.tsx
├── hooks/               # Custom hooks
├── lib/                 # Utility libraries
├── pages/               # Page components
├── services/            # Business logic services
├── types/               # TypeScript type definitions
├── utils/               # Utility functions
└── validation/          # Zod validation schemas
```

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS 4.0, shadcn/ui components
- **Form Management**: React Hook Form with Zod validation
- **State Management**: React Context API, SWR for data fetching
- **HTTP Client**: Axios with interceptors
- **Authentication**: OAuth2 with JWT tokens
- **Icons**: Lucide React
- **Build Tool**: Vite 6.2
- **Backend**: Frappe Framework

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher)
- **npm** or **yarn** package manager
- **Git**
- **Frappe Backend** (configured and running)

## 🚀 Local Development Setup

### 1. Clone the Repository

```bash
git clone https://github.com/Arkadyne-AUS/cpq_infrastructure.git
cd cpq_infrastructure/cpq-react-app
```

### 2. Install Dependencies

```bash
npm install
# or
yarn install
```

### 3. Environment Configuration

Create a `.env` file in the root directory:

```bash
# .env
VITE_API_BASE_URL=<INSERT_BASE_URL>
VITE_OAUTH_CLIENT_ID=<INSERT_CLIENT_ID>
```

### 4. Configure Frappe Backend

Ensure your Frappe instance has:

- **OAuth2 Client** configured with proper redirect URIs
- **Required DocTypes**: Customer, Quotation, Item, Address
- **API Access** enabled for the application
- **CORS** configured for your domain

### 5. Start Development Server

```bash
npm run dev
# or
yarn dev
```

The application will be available at `http://localhost:3000`

## 🔧 Available Scripts

| Command           | Description             |
|-------------------|-------------------------|
| `npm run dev`     | Start development server|
| `npm run build`   | Build for production    |
| `npm run lint`    | Run ESLint              |
| `npm run preview` | Preview production build|

## 🔐 Authentication Setup

The application uses OAuth2 authentication with Frappe. Configure your Frappe instance:

1. **Create OAuth2 Client** in Frappe
2. **Set Redirect URI** to `http://localhost:3000/oauth-callback`
3. **Configure Scopes** as needed
4. **Update environment variables** with client credentials

## 📝 Key Features Guide

### Customer Management
- Create new customers or select existing ones
- Manage customer addresses and contact information
- Support for both individual and business customers

### Lift Planning Workflow
1. **Customer Information**: Enter or select customer details
2. **Requirements**: Specify lift requirements (floors, capacity, etc.)
3. **Product Selection**: Choose from available lift products
4. **Interior Configuration**: Select cab interiors and finishes
5. **Add-ons**: Choose optional features and accessories
6. **Confirmation**: Review and generate quotation

### Quotation Generation
- Automatic pricing calculations
- PDF quotation generation
- Integration with Frappe backend
- Email capabilities

## 🎨 UI Components

The application uses shadcn/ui components with Tailwind CSS:

- **Forms**: React Hook Form with Zod validation
- **Navigation**: Responsive sidebar and navigation
- **Cards**: Product and information cards
- **Buttons**: Various button variants
- **Dialogs**: Modal dialogs for confirmations
- **Toast**: Success/error notifications

## 🔍 API Integration

### Frappe API Client
```typescript
// Example usage
import { frappeAPI } from '@/api/frappe';

// Get customer list
const customers = await frappeAPI.getDocTypeList('Customer');

// Create new quotation
const quotation = await frappeAPI.createDocType('Quotation', data);
```

### Service Layer
```typescript
// Example service usage
import QuotationService from '@/services/QuotationService';

// Submit quotation
const quotationId = await QuotationService.submitQuotation(formData);
```

## 🧪 Development Guidelines

### Code Structure
- Use **functional components** with hooks
- Implement **proper TypeScript types**
- Follow **component composition** patterns
- Use **custom hooks** for shared logic

### Form Validation
```typescript
// Example Zod schema
const customerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  email: z.string().email('Invalid email format'),
  phoneNumber: z.string().min(10, 'Phone number must be at least 10 digits')
});
```

### Error Handling
- Use **try-catch blocks** for API calls
- Implement **user-friendly error messages**
- Log errors for debugging
- Use **toast notifications** for user feedback


## 🚀 Production Deployment
### Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config({
  extends: [
    // Remove ...tseslint.configs.recommended and replace with this
    ...tseslint.configs.recommendedTypeChecked,
    // Alternatively, use this for stricter rules
    ...tseslint.configs.strictTypeChecked,
    // Optionally, add this for stylistic rules
    ...tseslint.configs.stylisticTypeChecked,
  ],
  languageOptions: {
    // other options...
    parserOptions: {
      project: ['./tsconfig.node.json', './tsconfig.app.json'],
      tsconfigRootDir: import.meta.dirname,
    },
  },
})
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config({
  plugins: {
    // Add the react-x and react-dom plugins
    'react-x': reactX,
    'react-dom': reactDom,
  },
  rules: {
    // other rules...
    // Enable its recommended typescript rules
    ...reactX.configs['recommended-typescript'].rules,
    ...reactDom.configs.recommended.rules,
  },
})
```

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```bash
VITE_API_BASE_URL=<INSERT_BASE_URL>
VITE_OAUTH_CLIENT_ID=<INSERT_CLIENT_ID>
```

### Deployment Options
- **Netlify**: Connect to Git repository
- **Vercel**: Deploy with automatic builds
- **AWS S3**: Static website hosting
- **Docker**: Containerized deployment

## 🔒 Security Considerations

- **Environment Variables**: Never commit sensitive data
- **Token Management**: Secure token storage and refresh
- **API Security**: Validate all API requests
- **CORS Configuration**: Proper CORS setup on backend
- **HTTPS**: Always use HTTPS in production

## 🐛 Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check OAuth2 client configuration
   - Verify redirect URIs
   - Ensure backend is accessible

2. **API Connection Issues**
   - Verify VITE_API_BASE_URL
   - Check CORS configuration
   - Validate network connectivity

3. **Build Errors**
   - Clear node_modules and reinstall
   - Check TypeScript errors
   - Verify environment variables

### Debug Mode
```bash
# Enable debug logging
DEBUG=1 npm run dev
```

## 📚 Additional Resources

- [React Documentation](https://reactjs.org/)
- [TypeScript Guide](https://www.typescriptlang.org/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Frappe Framework](https://frappeframework.com/)

## 🤝 Contributing

1. Clone the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 📞 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

---

**Happy Coding! 🚀**
