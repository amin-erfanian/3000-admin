import adminService, { signIn } from '@/services/admin.service';
import { jwtDecode } from 'jwt-decode';
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
