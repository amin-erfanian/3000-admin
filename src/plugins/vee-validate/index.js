import { configure, defineRule } from 'vee-validate';
import { localize, setLocale } from '@vee-validate/i18n';
import fa from '@vee-validate/i18n/dist/locale/fa.json';
import * as AllRules from '@vee-validate/rules';
import customRules from './rules';

export default function veeValidate() {
  Object.keys(AllRules).forEach((rule) => {
    defineRule(rule, AllRules[rule]);
  });

  for (const [ruleName, ruleFunction] of Object.entries(customRules)) {
    defineRule(ruleName, ruleFunction);
  }

  configure({
    generateMessage: localize({
      fa,
    }),
    validateOnBlur: false,
    validateOnChange: false,
    validateOnInput: true,
  });

  setLocale('fa');
}
