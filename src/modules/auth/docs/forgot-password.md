# Hướng dẫn triển khai chức năng Quên mật khẩu

## Giới thiệu

Tài liệu này mô tả chi tiết cách triển khai UI và xử lý chức năng quên mật khẩu trên phía Frontend. Chức năng này cho phép người dùng đặt lại mật khẩu khi quên bằng cách xác thực qua mã OTP gửi đến email.

## API Endpoints

### 1. Yêu cầu quên mật khẩu

- **URL**: `/api/v1/auth/forgot-password`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Vui lòng kiểm tra email để nhận mã OTP đặt lại mật khẩu"
  }
  ```

### 2. Gửi mã OTP đặt lại mật khẩu

- **URL**: `/api/v1/otp/send-password-reset`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Mã OTP đặt lại mật khẩu đã được gửi đến email của bạn"
  }
  ```

### 3. Đặt lại mật khẩu

- **URL**: `/api/v1/auth/reset-password`
- **Method**: `POST`
- **Request Body**:
  ```json
  {
    "email": "user@example.com",
    "otp": "123456",
    "newPassword": "newPassword123"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Đặt lại mật khẩu thành công, vui lòng đăng nhập với mật khẩu mới"
  }
  ```

## Luồng xử lý

1. Người dùng nhập email và yêu cầu đặt lại mật khẩu
2. Hệ thống gửi mã OTP đến email
3. Người dùng nhập mã OTP và mật khẩu mới
4. Hệ thống xác thực OTP và cập nhật mật khẩu mới

## Triển khai UI

### 1. Màn hình Quên mật khẩu

```jsx
import React, { useState } from 'react'
import { Button, TextField, Typography, Box, Paper, CircularProgress } from '@mui/material'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Gọi API quên mật khẩu
      await axios.post('/api/v1/auth/forgot-password', { email })

      // Gửi OTP đến email
      await axios.post('/api/v1/otp/send-password-reset', { email })

      setMessage('Mã OTP đã được gửi đến email của bạn')

      // Chuyển đến trang nhập OTP và mật khẩu mới
      setTimeout(() => {
        navigate('/reset-password', { state: { email } })
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant='h5' component='h1' gutterBottom>
          Quên mật khẩu
        </Typography>

        <Typography variant='body2' sx={{ mb: 3 }}>
          Nhập email đăng ký tài khoản, chúng tôi sẽ gửi mã OTP để đặt lại mật khẩu
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label='Email'
            type='email'
            fullWidth
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />

          {error && (
            <Typography color='error' sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {message && (
            <Typography color='success.main' sx={{ mb: 2 }}>
              {message}
            </Typography>
          )}

          <Button type='submit' variant='contained' fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Gửi yêu cầu'}
          </Button>

          <Button variant='text' fullWidth onClick={() => navigate('/login')} sx={{ mt: 1 }}>
            Quay lại đăng nhập
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

export default ForgotPasswordPage
```

### 2. Màn hình Đặt lại mật khẩu

```jsx
import React, { useState, useEffect } from 'react'
import { Button, TextField, Typography, Box, Paper, CircularProgress } from '@mui/material'
import axios from 'axios'
import { useNavigate, useLocation } from 'react-router-dom'

const ResetPasswordPage = () => {
  const location = useLocation()
  const [email, setEmail] = useState(location.state?.email || '')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    if (!email) {
      navigate('/forgot-password')
    }
  }, [email, navigate])

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    // Kiểm tra mật khẩu xác nhận
    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp')
      setLoading(false)
      return
    }

    try {
      // Gọi API đặt lại mật khẩu
      const response = await axios.post('/api/v1/auth/reset-password', {
        email,
        otp,
        newPassword,
      })

      setMessage(response.data.message)

      // Chuyển về trang đăng nhập sau khi đặt lại mật khẩu thành công
      setTimeout(() => {
        navigate('/login')
      }, 2000)
    } catch (error) {
      setError(error.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại')
    } finally {
      setLoading(false)
    }
  }

  const handleResendOtp = async () => {
    try {
      setLoading(true)
      await axios.post('/api/v1/otp/send-password-reset', { email })
      setMessage('Đã gửi lại mã OTP, vui lòng kiểm tra email')
    } catch (error) {
      setError(error.response?.data?.message || 'Không thể gửi lại OTP')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box
      sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}
    >
      <Paper elevation={3} sx={{ p: 4, maxWidth: 500, width: '100%' }}>
        <Typography variant='h5' component='h1' gutterBottom>
          Đặt lại mật khẩu
        </Typography>

        <Typography variant='body2' sx={{ mb: 3 }}>
          Vui lòng nhập mã OTP đã được gửi đến email {email} và mật khẩu mới của bạn
        </Typography>

        <form onSubmit={handleSubmit}>
          <TextField
            label='Email'
            type='email'
            fullWidth
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            disabled={!!location.state?.email}
            sx={{ mb: 2 }}
          />

          <TextField
            label='Mã OTP'
            fullWidth
            required
            value={otp}
            onChange={e => setOtp(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label='Mật khẩu mới'
            type='password'
            fullWidth
            required
            value={newPassword}
            onChange={e => setNewPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          <TextField
            label='Xác nhận mật khẩu'
            type='password'
            fullWidth
            required
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            sx={{ mb: 2 }}
          />

          {error && (
            <Typography color='error' sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          {message && (
            <Typography color='success.main' sx={{ mb: 2 }}>
              {message}
            </Typography>
          )}

          <Button type='submit' variant='contained' fullWidth disabled={loading} sx={{ mt: 2 }}>
            {loading ? <CircularProgress size={24} /> : 'Đặt lại mật khẩu'}
          </Button>

          <Button
            variant='text'
            fullWidth
            onClick={handleResendOtp}
            disabled={loading}
            sx={{ mt: 1 }}
          >
            Gửi lại mã OTP
          </Button>

          <Button variant='text' fullWidth onClick={() => navigate('/login')} sx={{ mt: 1 }}>
            Quay lại đăng nhập
          </Button>
        </form>
      </Paper>
    </Box>
  )
}

export default ResetPasswordPage
```

## Thêm route vào ứng dụng

```jsx
import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Register from './pages/Register'
import ForgotPasswordPage from './pages/ForgotPasswordPage'
import ResetPasswordPage from './pages/ResetPasswordPage'
// Import các component khác...

function App() {
  return (
    <Routes>
      <Route path='/login' element={<Login />} />
      <Route path='/register' element={<Register />} />
      <Route path='/forgot-password' element={<ForgotPasswordPage />} />
      <Route path='/reset-password' element={<ResetPasswordPage />} />
      {/* Các route khác... */}
    </Routes>
  )
}

export default App
```

## Tạo dịch vụ API

Tạo một file `authService.js` để quản lý các API call liên quan đến xác thực:

```javascript
import axios from 'axios'

const API_URL = process.env.REACT_APP_API_URL || ''

// Thiết lập Axios
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

const authService = {
  // Yêu cầu quên mật khẩu
  forgotPassword: async email => {
    try {
      await api.post('/api/v1/auth/forgot-password', { email })
      return await api.post('/api/v1/otp/send-password-reset', { email })
    } catch (error) {
      throw error
    }
  },

  // Đặt lại mật khẩu
  resetPassword: async (email, otp, newPassword) => {
    try {
      return await api.post('/api/v1/auth/reset-password', {
        email,
        otp,
        newPassword,
      })
    } catch (error) {
      throw error
    }
  },

  // Gửi lại mã OTP
  resendOtp: async email => {
    try {
      return await api.post('/api/v1/otp/send-password-reset', { email })
    } catch (error) {
      throw error
    }
  },
}

export default authService
```

## Thêm link vào trang đăng nhập

Thêm link "Quên mật khẩu" vào trang đăng nhập để người dùng có thể truy cập dễ dàng:

```jsx
// Trong component Login
<Box sx={{ mt: 2, textAlign: 'center' }}>
  <Link to='/forgot-password' style={{ textDecoration: 'none' }}>
    <Typography variant='body2' color='primary'>
      Quên mật khẩu?
    </Typography>
  </Link>
</Box>
```

## Xử lý lỗi

Luôn hiển thị thông báo lỗi rõ ràng cho người dùng và có cơ chế xử lý các trường hợp như:

- Email không tồn tại
- OTP không hợp lệ hoặc đã hết hạn
- Mật khẩu không đáp ứng yêu cầu bảo mật

## Bảo mật

1. Sử dụng HTTPS cho tất cả các API call
2. Không lưu trữ thông tin nhạy cảm ở localStorage hoặc sessionStorage
3. Giới hạn số lần gửi lại OTP để tránh lạm dụng hệ thống

## Hiệu năng

1. Thêm debounce cho các nút submit để tránh người dùng nhấn nhiều lần
2. Hiển thị loading state khi đang xử lý API

## Kiểm thử

Đảm bảo kiểm thử các trường hợp sau:

1. Nhập email không tồn tại
2. Nhập OTP sai
3. Nhập OTP đã hết hạn
4. Mật khẩu không đáp ứng yêu cầu độ phức tạp
5. Mật khẩu xác nhận không khớp
6. Luồng thành công hoàn chỉnh
