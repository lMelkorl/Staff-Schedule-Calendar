import { useState } from 'react';
import type { FormEvent } from 'react';
import AuthSession from '../utils/session';
import '../styles/login.scss';

interface LoginFormData {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
}

const Login = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Mock login - Demo için
    setTimeout(() => {
      // Mock user data
      const mockUser = {
        id: '1',
        name: 'Demo User',
        email: formData.email,
        phone: '+90 555 123 4567',
        roles: 1, // Admin role
        organizationId: 'org-123',
        departmentId: 'dept-456',
        language: 'en'
      };

      // Session'a kaydet
      AuthSession.setId(mockUser.id);
      AuthSession.setName(mockUser.name);
      AuthSession.setEmail(mockUser.email);
      AuthSession.setPhoneNumber(mockUser.phone);
      AuthSession.setRoles(String(mockUser.roles));
      AuthSession.setOrganizationId(mockUser.organizationId);
      AuthSession.setDepartmentId(mockUser.departmentId);
      AuthSession.setLanguage(mockUser.language);

      setIsLoading(false);

      // Calendar'a yönlendir
      window.location.href = '/';
    }, 1000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h1>Staff Schedule Calendar</h1>
          <p>Sign in to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={errors.email ? 'error' : ''}
              placeholder="Enter your email"
              disabled={isLoading}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={errors.password ? 'error' : ''}
              placeholder="Enter your password"
              disabled={isLoading}
            />
            {errors.password && <span className="error-message">{errors.password}</span>}
          </div>

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          <div className="demo-info">
            <p>Demo Login</p>
            <small>Any email and password (min 6 chars) will work</small>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
