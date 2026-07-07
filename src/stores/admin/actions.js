import adminService from '@/services/admin.service';
import { toast } from 'vue3-toastify';

import { useRouter } from 'vue-router';
const router = useRouter();

export default {
  async signIn(payload) {
    try {
      await adminService.signIn(payload);
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  async logout() {
    localStorage.removeItem('token');
    this.resetLoginData();
    router.push('/sign-in');
  },

  resetLoginData() {
    this.$patch({
      phone: '',
      isLoggedIn: false,
      isNew: false,
      profile: {},
    });
    // await adminService.logout();
  },
};
