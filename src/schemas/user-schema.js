import * as Yup from 'yup';

const userSchema = Yup.object().shape({
  phone: Yup.string().required('شماره همراه الزامیست.'),
  // TODO:check phone number verification
  password: Yup.string()
    .min(4, 'پسوورد باید حداقل شامل 4 کاراکتر باشد.')
    .required('وارد کردن کلمه عبور الزامیست.'),
  name: Yup.string()
    .min(2, 'نام حداقل باید شامل 2 کاراکتر باشد.')
    .required('نام الزامیست.'),
});

export default userSchema;
