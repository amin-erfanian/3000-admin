<template>
  <div class="date-picker">
    <div class="date-picker__header">
      <div class="date-picker__month-year-label" @click="toggleYearMonthPicker">
        <span>{{ months[state.month] }} {{ state.year }}</span>
        <base-icon
          iconName="arrow-left"
          class="next-icon"
          :class="{ active: showYearMonthPicker }"
        />
      </div>

      <div class="date-picker__month-selection">
        <div class="prev-month">
          <base-icon
            @click="prevMonth"
            iconName="arrow-left"
            class="prev-month-icon"
          />
        </div>
        <div class="next-month">
          <base-icon
            @click="nextMonth"
            iconName="arrow-left"
            class="next-month-icon"
          />
        </div>
      </div>
    </div>
    <div class="date-picker__body">
      <!-- Days View -->
      <div v-if="!showYearMonthPicker" class="month-days-selector">
        <div class="day-names">
          <div v-for="day in dayNames" :key="day">{{ day }}</div>
        </div>
        <div class="days">
          <div
            class="day-cell-wrapper"
            v-for="(day, index) in daysInMonth"
            :key="index"
            @click="day !== '' && selectDate(day)"
          >
            <div
              class="day-cell"
              :class="{
                empty: day === '',
                today: isToday(day),
                selected: isSelected(day),
              }"
            >
              {{ day }}
            </div>
          </div>
        </div>
        <div class="today-button-wrapper">
          <button class="today-button" @click="moveToToday">
            برو به امروز
          </button>
        </div>
      </div>

      <!-- Year and Month Selector View -->
      <div v-else class="year-month-selector">
        <div class="year-selector">
          <div class="scroll-container" ref="yearScrollContainer">
            <div @click="attachPreviousYears">...</div>
            <div
              v-for="y in years"
              :key="y"
              :ref="(el) => setYearRef(el, y)"
              :class="{ selected: y === state.year }"
              @click="selectYear(y)"
            >
              {{ y }}
            </div>
          </div>
        </div>
        <div class="month-selector">
          <div class="scroll-container" ref="monthScrollContainer">
            <div
              v-for="(month, index) in months"
              :key="index"
              :ref="(el) => setMonthRef(el, index)"
              :class="{ selected: index === state.month }"
              @click="selectMonth(index)"
            >
              {{ month }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
  import { ref, reactive, watch, computed, nextTick } from 'vue';
  import jalaali from 'jalaali-js';
  import BaseIcon from '@/components/common/base/base-icon.vue';

  const props = defineProps({
    modelValue: {
      type: String,
      default: () => {
        const today = new Date();
        const jToday = jalaali.toJalaali(
          today.getFullYear(),
          today.getMonth() + 1,
          today.getDate(),
        );
        return `${jToday.jy}/${jToday.jm}/${jToday.jd}`;
      },
    },
    width: {
      type: String,
      default: 'auto',
    },
  });

  const emit = defineEmits(['update:modelValue']);

  const today = new Date();
  const jToday = jalaali.toJalaali(
    today.getFullYear(),
    today.getMonth() + 1,
    today.getDate(),
  );

  // Parse the initial modelValue
  const [year, month, day] = props.modelValue.split('/').map(Number);

  const state = reactive({
    year: year || jToday.jy,
    month: month - 1 || jToday.jm - 1,
    day: day || jToday.jd,
  });

  const showYearMonthPicker = ref(false); // Track if year/month selector is visible

  const dayNames = ['ش', 'ی', 'د', 'س', 'چ', 'پ', 'ج'];
  const months = [
    'فروردین',
    'اردیبهشت',
    'خرداد',
    'تیر',
    'مرداد',
    'شهریور',
    'مهر',
    'آبان',
    'آذر',
    'دی',
    'بهمن',
    'اسفند',
  ];
  const jalaaliDays = [6, 0, 1, 2, 3, 4, 5];

  const years = ref([]); // Use a ref to store the years array

  // Function to initialize the years array
  const initializeYears = () => {
    const currentYear = state.year;
    const startYear = currentYear - 20; // Start 20 years before the current year
    const endYear = currentYear + 20; // End 20 years after the current year

    years.value = Array.from(
      { length: endYear - startYear + 1 },
      (_, i) => startYear + i,
    );
  };

  initializeYears();

  const attachPreviousYears = () => {
    const firstYear = years.value[0]; // Get the first year in the array
    const newYears = Array.from({ length: 10 }, (_, i) => firstYear - 10 + i); // Generate 10 years before the first year

    years.value.unshift(...newYears); // Prepend the new years to the array
  };

  // Refs for scrolling to the selected year and month
  const yearScrollContainer = ref(null);
  const monthScrollContainer = ref(null);
  const yearRefs = ref({});
  const monthRefs = ref({});

  const setYearRef = (el, year) => {
    if (el) yearRefs.value[year] = el;
  };

  const setMonthRef = (el, month) => {
    if (el) monthRefs.value[month] = el;
  };

  const toggleYearMonthPicker = async () => {
    showYearMonthPicker.value = !showYearMonthPicker.value;

    if (showYearMonthPicker.value) {
      await nextTick();

      setTimeout(() => {
        if (yearRefs.value[state.year] && yearScrollContainer.value) {
          const yearElement = yearRefs.value[state.year];
          const container = yearScrollContainer.value;
          const yearRect = yearElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const yearOffset = yearRect.top - containerRect.top;
          const containerHeight = container.clientHeight;
          const yearHeight = yearElement.clientHeight;

          container.scrollTo({
            top: yearOffset - (containerHeight / 2 - yearHeight / 2),
            behavior: 'smooth',
          });
        }

        if (monthRefs.value[state.month] && monthScrollContainer.value) {
          const monthElement = monthRefs.value[state.month];
          const container = monthScrollContainer.value;
          const monthRect = monthElement.getBoundingClientRect();
          const containerRect = container.getBoundingClientRect();
          const monthOffset = monthRect.top - containerRect.top;
          const containerHeight = container.clientHeight;
          const monthHeight = monthElement.clientHeight;

          container.scrollTo({
            top: monthOffset - (containerHeight / 2 - monthHeight / 2),
            behavior: 'smooth',
          });
        }
      }, 0);
    }
  };

  const selectYear = (year) => {
    state.year = year;
    // toggleYearMonthPicker();
  };

  const selectMonth = (month) => {
    state.month = month;
    // toggleYearMonthPicker();
  };

  const prevMonth = () => {
    if (state.month === 0) {
      state.month = 11;
      state.year -= 1;
    } else {
      state.month -= 1;
    }
  };

  const nextMonth = () => {
    if (state.month === 11) {
      state.month = 0;
      state.year += 1;
    } else {
      state.month += 1;
    }
  };

  const moveToToday = () => {
    state.year = jToday.jy;
    state.month = jToday.jm - 1;
    state.day = jToday.jd;

    selectDate(jToday.jd);
  };

  const getDaysInMonth = (year, month) => {
    const jDaysInMonth = jalaali.jalaaliMonthLength(year, month + 1);
    const firstDayOfMonth = new Date(
      jalaali.toGregorian(year, month + 1, 1).gy,
      jalaali.toGregorian(year, month + 1, 1).gm - 1,
      jalaali.toGregorian(year, month + 1, 1).gd,
    ).getDay();

    const adjustedFirstDayOfMonth = jalaaliDays.indexOf(firstDayOfMonth);

    const days = [];
    for (let i = 0; i < adjustedFirstDayOfMonth; i++) {
      days.push('');
    }
    for (let i = 1; i <= jDaysInMonth; i++) {
      days.push(i);
    }
    return days;
  };

  const daysInMonth = computed(() => getDaysInMonth(state.year, state.month));

  const isToday = (day) => {
    return (
      day === jToday.jd &&
      state.month === jToday.jm - 1 &&
      state.year === jToday.jy
    );
  };

  const isSelected = (day) => {
    const [selectedYear, selectedMonth, selectedDay] = props.modelValue
      .split('/')
      .map(Number);
    return (
      selectedDay === day &&
      selectedMonth === state.month + 1 &&
      selectedYear === state.year
    );
  };

  const selectDate = (day) => {
    state.day = day;
    const dateString = `${state.year}/${state.month + 1}/${state.day}`;

    emit('update:modelValue', dateString);
  };

  watch(
    () => props.modelValue,
    (newVal) => {
      const [newYear, newMonth, newDay] = newVal.split('/').map(Number);
      state.year = newYear;
      state.month = newMonth - 1;
      state.day = newDay;
    },
  );
</script>

<style scoped lang="scss">
  .date-picker {
    user-select: none;
    direction: rtl;
    width: 100%;
    border: none;
    // background: var(--palette-background);
    z-index: 100;
    padding: 10px;
    min-height: 374px;

    &__header {
      color: var(--palette-text-on-main-10);
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 28px;
    }

    &__month-selection {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: space(10);

      .prev-month {
        display: flex;
        align-items: center;
        justify-content: space-between;
        -webkit-transform: scaleX(-1);
        transform: scaleX(-1);
        &-icon {
          width: 24px;
          color: #00aaff;
        }
      }
      .next-month {
        display: flex;
        align-items: center;
        justify-content: space-between;
        &-icon {
          width: 24px;
          color: #00aaff;
        }
      }
    }

    &__month-year-label {
      display: flex;
      align-items: center;
      gap: space(2);
      .next-icon {
        width: 18px;
        color: #00aaff;
        transition: all 0.3s;

        &.active {
          transform: rotate(90deg);
        }
      }
    }

    &__body {
      color: var(--palette-text-on-main-10);
      display: flex;
      flex-direction: column;
      width: 100%;

      .month-days-selector {
        width: 100%;
        flex: 1;
        display: flex;
        flex-direction: column;

        .day-names {
          display: flex;
          justify-content: space-between;
          font-weight: bold;
          color: var(--palette-text-on-main-30);
          margin-bottom: 6px;

          div {
            display: flex;
            flex: 1;
            justify-content: center;
            align-items: center;
          }
        }

        .days {
          display: flex;
          flex-wrap: wrap;

          .day-cell-wrapper {
            position: relative;
            @include flex($align: center, $justify: center);
            width: calc(100% / 7);
            padding: 10px;
            text-align: center;
            cursor: pointer;
            transition: background-color 0.3s;
            color: var(--palette-text-on-main-10);

            .day-cell {
              @include flex($align: center, $justify: center);
              border-radius: $circle;
              width: 32px;
              height: 32px;
              flex-shrink: 0;

              &.empty {
                background: none;
                cursor: default;
              }

              &.today {
                background: #e0f7fa;
                color: #00aaff;
              }

              &.selected {
                background: #00aaff;
                color: #ffffff;
              }
            }
          }
        }

        .today-button-wrapper {
          margin-top: auto;
          margin-right: auto;
          width: 100%;
          max-width: 160px;
          padding-top: space(2);
        }

        .today-button {
          padding: 10px 20px;
          width: 100%;
          background: var(--palette-container-background);
          color: var(--palette-text-on-main-10);
          border: none;
          border-radius: 8px;
          cursor: pointer;
          text-align: center;
          font-size: 12px;

          &:focus {
            outline: none;
          }
        }
      }

      .year-month-selector {
        width: 100%;
        display: flex;
        gap: 20px;

        .year-selector,
        .month-selector {
          flex: 1;
          max-height: 270px;

          .scroll-container {
            @include hide-scrollbar();
            overflow-y: auto;
            max-height: 270px;
            scroll-behavior: smooth;

            div {
              padding: 10px;
              text-align: center;
              cursor: pointer;
              border-radius: 8px;
              margin: 4px 0;
              transition: all 0.3s;

              &.selected {
                background: #00aaff;
                color: #ffffff;
              }
            }
          }
        }
      }
    }
  }
</style>
