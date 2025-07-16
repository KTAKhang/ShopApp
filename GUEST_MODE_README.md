# 🛍️ Guest Mode - Chế độ khách

## 📋 Tổng quan

Ứng dụng ShopApp hiện tại đã được cập nhật để hỗ trợ **Guest Mode** - cho phép người dùng chưa đăng nhập có thể xem sản phẩm trước khi quyết định mua hàng.

## 🎯 Tính năng Guest Mode

### ✅ **Guest có thể làm:**

- **Xem trang chủ** (HomePage) - Danh sách sản phẩm mới và bán chạy
- **Xem chi tiết sản phẩm** (ProductDetail) - Thông tin đầy đủ, hình ảnh, đánh giá
- **Duyệt tất cả sản phẩm** (AllProducts) - Tìm kiếm, lọc theo danh mục
- **Xem danh mục sản phẩm** - Phân loại sản phẩm
- **Tìm kiếm sản phẩm** - Tìm kiếm theo tên sản phẩm

### 🔒 **Guest KHÔNG thể làm:**

- Thêm sản phẩm vào giỏ hàng
- Xem giỏ hàng
- Thanh toán
- Xem lịch sử đơn hàng
- Xem hồ sơ cá nhân
- Đánh giá sản phẩm

## 🚀 Cách hoạt động

### 1. **Khởi động ứng dụng**

- Guest được chuyển thẳng đến **HomePage** thay vì màn hình đăng nhập
- Có thể xem tất cả sản phẩm ngay lập tức

### 2. **Navigation**

- **TopNavBar**: Hiển thị nút "Đăng nhập" cho Guest
- **BottomNavigation**: Các tab cần auth sẽ hiển thị mờ và yêu cầu đăng nhập khi click

### 3. **Thông báo yêu cầu đăng nhập**

Khi Guest cố gắng sử dụng tính năng cần authentication:

```
"Yêu cầu đăng nhập
Bạn cần đăng nhập để [tính năng]. Bạn có muốn đăng nhập ngay không?"
```

### 4. **Auto-navigation sau đăng nhập** 🆕

- **User thường**: Tự động chuyển về **HomePage** sau khi đăng nhập thành công
- **Admin**: Tự động chuyển đến **AdminScreen** sau khi đăng nhập thành công
- **Toast notification**: Hiển thị thông báo "Đăng nhập thành công!"

## 🔧 Cấu trúc code

### **Navigation (AppNavigator.js)**

```javascript
// Public routes - Guest có thể xem
<Stack.Screen name="HomePage" component={HomeScreen} />
<Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
<Stack.Screen name="AllProducts" component={AllProductsScreen} />

// Protected routes - Chỉ user đã đăng nhập
{isAuthenticated && (
  <Stack.Screen name="Cart" component={CartScreen} />
  <Stack.Screen name="Profile" component={ProfileScreen} />
  // ...
)}
```

### **Authentication Check**

```javascript
// Trong components
const { isAuthenticated } = useSelector((state) => state.auth);

const handleAddToCart = () => {
  if (!isAuthenticated) {
    Alert.alert("Yêu cầu đăng nhập", "...");
    return;
  }
  // Proceed with action
};
```

### **Utility Functions (utils/authUtils.js)**

```javascript
import { requireAuth, withAuth, navigateAfterLogin } from "../utils/authUtils";

// Simple check
if (requireAuth(isAuthenticated, navigation, "thêm vào giỏ hàng")) {
  // Proceed
}

// With callback
withAuth(isAuthenticated, navigation, "giỏ hàng", () => {
  navigation.navigate("Cart");
});

// Auto-navigation after login
navigateAfterLogin(navigation, user); // Goes to HomePage or Admin based on role
```

### **Auto-navigation Logic**

```javascript
// In LoginScreen.js
useEffect(() => {
  if (isAuthenticated && user) {
    Toast.show({
      type: "success",
      text1: "Thành công",
      text2: "Đăng nhập thành công!",
    });
    handleLoginSuccess(navigation, user);
  }
}, [isAuthenticated, user, navigation]);

// In AppNavigator.js
useEffect(() => {
  if (isAuthenticated && navigationRef.current && user) {
    navigateAfterLogin(navigationRef.current, user);
  }
}, [isAuthenticated, user]);
```

## 🎨 UI/UX Features

### **Visual Indicators**

- **Nút đăng nhập** trong TopNavBar cho Guest
- **Tab mờ** trong BottomNavigation cho các tính năng cần auth
- **Thông báo rõ ràng** khi yêu cầu đăng nhập

### **Smooth Experience**

- Guest có thể xem sản phẩm đầy đủ
- Chỉ yêu cầu đăng nhập khi thực sự cần thiết
- Dễ dàng chuyển từ Guest sang User
- **Auto-navigation** sau đăng nhập không cần thao tác thêm

## 📱 User Flow

### **Guest Journey:**

1. **Mở app** → HomePage (xem sản phẩm)
2. **Duyệt sản phẩm** → ProductDetail, AllProducts
3. **Quyết định mua** → Click "Thêm vào giỏ hàng"
4. **Yêu cầu đăng nhập** → Chuyển đến Login/Register
5. **Đăng nhập thành công** → **Tự động chuyển về HomePage** 🆕

### **User Journey:**

1. **Đã đăng nhập** → Full access to all features
2. **Thêm vào giỏ hàng** → Direct action
3. **Thanh toán** → Seamless experience

### **Admin Journey:**

1. **Đăng nhập với role admin** → **Tự động chuyển đến AdminScreen** 🆕
2. **Quản lý hệ thống** → Admin features

## 🔄 Migration từ Private Mode

### **Thay đổi chính:**

1. **AppNavigator**: Thêm public routes, đặt HomePage làm initial route
2. **TopNavBar**: Thêm nút đăng nhập cho Guest
3. **BottomNavigation**: Xử lý auth check cho các tab
4. **ProductCard**: Auth check trước khi thêm vào giỏ hàng
5. **ProductDetailScreen**: Auth check cho cart actions
6. **Auto-navigation**: Tự động chuyển về HomePage/Admin sau đăng nhập 🆕

### **Backward Compatibility:**

- Tất cả tính năng cũ vẫn hoạt động bình thường
- User đã đăng nhập không bị ảnh hưởng
- Admin mode vẫn hoạt động như cũ

## 🎯 Benefits

### **Cho Business:**

- **Tăng conversion rate** - Guest có thể xem sản phẩm trước khi quyết định đăng ký
- **Giảm friction** - Không bắt buộc đăng nhập ngay từ đầu
- **Better UX** - Trải nghiệm mượt mà hơn
- **Seamless login flow** - Tự động chuyển về trang phù hợp sau đăng nhập

### **Cho Users:**

- **Browse freely** - Xem sản phẩm mà không cần tạo tài khoản
- **Informed decisions** - Đủ thông tin để quyết định mua hàng
- **Easy registration** - Chỉ đăng ký khi thực sự cần
- **Smooth transition** - Tự động về trang chủ sau đăng nhập

## 🚀 Future Enhancements

### **Có thể thêm:**

- **Guest cart** - Lưu sản phẩm tạm thời cho Guest
- **Wishlist** - Danh sách yêu thích cho Guest
- **Social login** - Đăng nhập nhanh bằng Google/Facebook
- **Guest checkout** - Thanh toán không cần tài khoản
- **Remember last page** - Ghi nhớ trang cuối cùng Guest đang xem

---

**🎉 Guest Mode đã sẵn sàng!** Người dùng có thể xem sản phẩm tự do và chỉ cần đăng nhập khi muốn mua hàng. Sau khi đăng nhập, họ sẽ tự động được chuyển về trang chủ một cách mượt mà! 🛍️✨
