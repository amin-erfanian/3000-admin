import adminService from '@/services/admin.service';
import { toast } from 'vue3-toastify';

import router from '@/router';

export default {
  async signIn(payload) {
    try {
      const { profile } = await adminService.signIn(payload);
      // auth token lives in an httpOnly cookie; this flag only tells the router guard we're signed in
      localStorage.setItem('isLoggedIn', 'true');
      this.$patch({ isLoggedIn: true, profile: profile ?? {} });
    } catch (error) {
      toast.error(error.message);
      throw error;
    }
  },

  async logout() {
    localStorage.removeItem('isLoggedIn');
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
