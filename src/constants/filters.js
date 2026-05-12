export const FILTER_ITEMS = [
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
    label: 'رنگ',
    type: 'checkbox',
    key: 'colors',
    items: [
      { label: 'سفید', value: '1' },
      { label: 'آبی', value: '2' },
      { label: 'بنفش', value: '3' },
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
  {
    label: 'پر فروش',
    type: 'badge',
    key: 'heigh_selling',
  },
  {
    label: 'پر طرفدار',
    type: 'badge',
    key: 'heigh_demand',
  },
  {
    label: 'درحال اتمام موجودی',
    type: 'badge',
    key: 'low_stock',
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
