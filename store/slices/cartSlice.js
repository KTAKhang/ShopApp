import { createSlice } from '@reduxjs/toolkit';

// Initial state của giỏ hàng
const initialState = {
    items: [], // Danh sách sản phẩm trong giỏ hàng
    totalQuantity: 0, // Tổng số lượng sản phẩm trong giỏ hàng
    totalPrice: 0, // Tổng giá trị đơn hàng
};

// Tạo slice cho giỏ hàng
const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        // Thêm sản phẩm vào giỏ hàng
        addProductToCart(state, action) {
            const { product_id, name, price, quantity } = action.payload;

            // Kiểm tra xem sản phẩm đã có trong giỏ hàng chưa
            const existingProduct = state.items.find(item => item.product_id === product_id);

            if (existingProduct) {
                // Nếu sản phẩm đã có, chỉ cần cập nhật số lượng
                existingProduct.quantity += quantity;
            } else {
                // Nếu chưa có sản phẩm trong giỏ hàng, thêm mới
                state.items.push({ product_id, name, price, quantity });
            }

            // Cập nhật lại tổng số lượng và tổng giá trị giỏ hàng
            state.totalQuantity += quantity;
            state.totalPrice += price * quantity;
        },

        // Cập nhật số lượng sản phẩm trong giỏ hàng
        updateProductQuantity(state, action) {
            const { product_id, quantity } = action.payload;

            // Tìm sản phẩm trong giỏ hàng
            const existingProduct = state.items.find(item => item.product_id === product_id);

            if (existingProduct) {
                // Cập nhật số lượng mới
                const quantityChange = quantity - existingProduct.quantity;
                existingProduct.quantity = quantity;

                // Cập nhật lại tổng số lượng và tổng giá trị giỏ hàng
                state.totalQuantity += quantityChange;
                state.totalPrice += existingProduct.price * quantityChange;
            }
        },

        // Xóa sản phẩm khỏi giỏ hàng
        removeProductFromCart(state, action) {
            const { product_id } = action.payload;

            // Tìm sản phẩm trong giỏ hàng và xóa nó
            const existingProduct = state.items.find(item => item.product_id === product_id);

            if (existingProduct) {
                // Cập nhật lại tổng số lượng và tổng giá trị giỏ hàng
                state.totalQuantity -= existingProduct.quantity;
                state.totalPrice -= existingProduct.price * existingProduct.quantity;

                // Xóa sản phẩm khỏi giỏ hàng
                state.items = state.items.filter(item => item.product_id !== product_id);
            }
        },

        // Reset giỏ hàng khi người dùng thanh toán hoặc hủy giỏ hàng
        resetCart(state) {
            state.items = [];
            state.totalQuantity = 0;
            state.totalPrice = 0;
        },
    },
});

// Export các action creators và reducer
export const { addProductToCart, updateProductQuantity, removeProductFromCart, resetCart } = cartSlice.actions;
export default cartSlice.reducer;
