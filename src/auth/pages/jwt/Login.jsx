import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { KeenIcon } from '@/components';
import { useAuthContext } from '@/auth';
import { useLayout } from '@/providers';
import { Alert } from '@/components';
import {toAbsoluteUrl} from "@/utils/index.js";
const loginSchema = Yup.object().shape({
  email: Yup.string().email('Wrong email format').min(3, 'Minimum 3 characters').max(50, 'Maximum 50 characters').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters long').max(50, 'Maximum 50 characters').required('Password is required'),
  remember: Yup.boolean()
});
const savedEmail = localStorage.getItem('email');
const initialValues = {
  email: savedEmail || '',
  password: '',
  remember: !!savedEmail,
};
const Login = () => {
  const [loading, setLoading] = useState(false);
  const {
    login
  } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [showPassword, setShowPassword] = useState(false);
  const {
    currentLayout
  } = useLayout();
  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, {
      setStatus,
      setSubmitting
    }) => {
      setLoading(true);
      try {
        if (!login) {
          throw new Error('JWTProvider is required for this form.');
        }
        await login(values.email, values.password);
        if (values.remember) {
          localStorage.setItem('email', values.email);
        } else {
          localStorage.removeItem('email');
        }
        navigate(from, {
          replace: true
        });
      } catch {
        setStatus('The login details are incorrect');
        setSubmitting(false);
      }
      setLoading(false);
    }
  });
  const togglePassword = event => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };
  return <div className="card max-w-[590px] w-full p-large">
      <form className="card-body flex flex-col gap-5 p-10" onSubmit={formik.handleSubmit} noValidate>
        <div className="text-center mb-2.5">
          <img src="/media/app/RJL.png" className="h-[100px] max-w-none w-[100px]" alt="logo"/>
          <h3 className="fs-large font-semibold text-gray-900 leading-none mb-2.5">Sign in</h3>
          {/* <div className="flex items-center justify-center font-medium">
            <span className="text-2sm text-gray-600 me-1.5">Need an account?</span>
            <Link to={currentLayout?.name === 'auth-branded' ? '/auth/signup' : '/auth/classic/signup'} className="text-2sm link">
              Sign up
            </Link>
          </div> */}
        </div>

        {/* <div className="grid grid-cols-2 gap-2.5">
          <a href="#" className="btn btn-light btn-sm justify-center">
            <img src={toAbsoluteUrl('/media/brand-logos/google.svg')} className="size-3.5 shrink-0" />
            Use Google
          </a>

          <a href="#" className="btn btn-light btn-sm justify-center">
            <img src={toAbsoluteUrl('/media/brand-logos/apple-black.svg')} className="size-3.5 shrink-0 dark:hidden" />
            <img src={toAbsoluteUrl('/media/brand-logos/apple-white.svg')} className="size-3.5 shrink-0 light:hidden" />
            Use Apple
          </a>
        </div> */}

        {/* <div className="flex items-center gap-2">
         <span className="border-t border-gray-200 w-full"></span>
         <span className="text-2xs text-gray-500 font-medium uppercase">Or</span>
         <span className="border-t border-gray-200 w-full"></span>
        </div> */}

        {/*<Alert variant="primary">*/}
        {/*  Use <span className="font-semibold text-gray-900">demo@email.com</span> username and{' '}*/}
        {/*  <span className="font-semibold text-gray-900">123456</span> password.*/}
        {/*</Alert>*/}

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1 mt-4">
          <label className="form-label text-gray-900 fs-medium">Email</label>
          <label className="input">
            <input placeholder="Enter username" autoComplete="off" {...formik.getFieldProps('email')} className={clsx('form-control', {
            'is-invalid': formik.touched.email && formik.errors.email
          })} />
          </label>
          {formik.touched.email && formik.errors.email && <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.email}
            </span>}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1 mt-4">
            <label className="form-label text-gray-900 fs-medium">Password</label>
            <Link to={currentLayout?.name === 'auth-branded' ? '/auth/reset-password' : '/auth/classic/reset-password'} className="text-2sm link shrink-0">
              Forgot Password?
            </Link>
          </div>
          <label className="input">
            <input type={showPassword ? 'text' : 'password'} placeholder="Enter Password" autoComplete="off" {...formik.getFieldProps('password')} className={clsx('form-control', {
            'is-invalid': formik.touched.password && formik.errors.password
          })} />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', {
              hidden: showPassword
            })} />
              <KeenIcon icon="eye-slash" className={clsx('text-gray-500', {
              hidden: !showPassword
            })} />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && <span role="alert" className="text-danger text-xs mt-1">
              {formik.errors.password}
            </span>}
        </div>

        <label className="checkbox-group mt-4">
          <input className="checkbox checkbox-sm" type="checkbox" {...formik.getFieldProps('remember')} />
          <span className="checkbox-label">Remember me</span>
        </label>

        <button type="submit" className="btn btn-primary flex justify-center grow mt-4" disabled={loading || formik.isSubmitting}>
          {loading ? 'Please wait...' : 'Sign In'}
        </button>
      </form>

    <style>
      {`
        .p-large {
          padding:100px 40px;
        }
        .fs-large {
          font-size: 24px;
        }
        .fs-medium {
          font-size: 18px;
        }
      `}
    </style>
    </div>;
};
export { Login };
