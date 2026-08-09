export const PRODUCT_FILTER_ITEMS = [
  {
    label: 'کد فروشندگی',
    type: 'text',
    key: 'code',
  },
  {
    label: 'موبایل',
    type: 'text',
    key: 'phone',
  },
  {
    label: 'نام فروشگاه',
    type: 'text',
    key: 'title',
  },
];

export const BRAND_FILTER_ITEMS = [
  {
    label: 'وضعیت',
    type: 'checkbox',
    key: 'statuses',
    items: [
      { label: 'پیش نویس', value: 'draft' },
      { label: 'آماده انتشار', value: 'pending' },
      { label: 'تایید شده', value: 'active' },
      { label: 'رد شده', value: 'inactive' },
    ],
  },
];

export const SELLER_FILTER_ITEMS = [
  {
    label: 'گروه اصلی',
    type: 'checkbox',
    key: 'categories',
    items: [
      { label: 'لپ تاپ', value: 'laptop' },
      { label: 'استیکر', value: 'sticker' },
      { label: 'فلش مموری', value: 'usb' },
    ],
  },
  {
    label: 'برند کالا',
    type: 'checkbox',
    key: 'brands',
    items: [
      { label: 'سونی', value: 'sony' },
      { label: 'ایسر', value: 'acer' },
      { label: 'ایسوز', value: 'asus' },
      { label: 'اپل', value: 'apple' },
    ],
  },
  {
    label: 'نوع کالا',
    type: 'checkbox',
    key: 'types',
    items: [
      { label: 'ورزشی', value: 'sports' },
      { label: 'رو میزی', value: 'desktop' },
      { label: 'الترابوک', value: 'ultra_book' },
    ],
  },
  {
    label: 'وضعیت',
    type: 'checkbox',
    key: 'statuses',
    items: [
      { label: 'قابل فروش', value: 'marketable' },
      { label: 'به زودی', value: 'coming_soon' },
      { label: 'توقف تولید', value: 'stop_production' },
    ],
  },
  {
    label: 'اصالت کالا',
    type: 'radio',
    key: 'fake',
    items: [
      { label: 'اصل', value: 'false' },
      { label: 'غیراصل', value: 'true' },
    ],
  },
];
