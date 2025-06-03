import React from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator
} from 'react-native';

const ChangePasswordModal = ({
    visible,
    onClose,
    currentPassword,
    newPassword,
    confirmPassword,
    setCurrentPassword,
    setNewPassword,
    setConfirmPassword,
    onSubmit,
    isLoading = false
}) => {
    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <Text style={styles.title}>Đổi mật khẩu</Text>

                    <TextInput
                        placeholder="Mật khẩu hiện tại"
                        secureTextEntry
                        style={styles.input}
                        value={currentPassword}
                        onChangeText={setCurrentPassword}
                        editable={!isLoading}
                    />

                    <TextInput
                        placeholder="Mật khẩu mới (tối thiểu 6 ký tự)"
                        secureTextEntry
                        style={styles.input}
                        value={newPassword}
                        onChangeText={setNewPassword}
                        editable={!isLoading}
                    />

                    <TextInput
                        placeholder="Xác nhận mật khẩu"
                        secureTextEntry
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        editable={!isLoading}
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={[styles.cancelButton, isLoading && styles.disabledButton]}
                            onPress={onClose}
                            disabled={isLoading}
                        >
                            <Text style={styles.cancelButtonText}>Huỷ</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[styles.submitButton, isLoading && styles.disabledButton]}
                            onPress={onSubmit}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Xác nhận</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );
};

const styles = StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.4)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        width: '90%',
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 16,
        textAlign: 'center',
        color: '#374151',
    },
    input: {
        borderWidth: 1,
        borderColor: '#d1d5db',
        borderRadius: 8,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginBottom: 12,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    cancelButton: {
        backgroundColor: '#6b7280',
        padding: 12,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
    },
    submitButton: {
        backgroundColor: '#3b82f6',
        padding: 12,
        borderRadius: 8,
        width: '48%',
        alignItems: 'center',
        minHeight: 44,
        justifyContent: 'center',
    },
    disabledButton: {
        opacity: 0.6,
    },
    cancelButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
    submitButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
    },
});

export default ChangePasswordModal;