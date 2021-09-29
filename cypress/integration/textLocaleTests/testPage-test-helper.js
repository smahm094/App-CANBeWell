import TestPage from '../../pageObjects/testPage';
import { cookiesSetupAndAccessBodyPage } from './base-test-helper';

function generateTestDataSet(props, user) {
  const test = props.Test;
  const text = props['Patient/Provider Text'];
  const gender = props.Gender;
  const minAge = props['Minimum age'];
  const maxAge = props['Maximum age'];
  const ageSet = new Set();
  ageSet.add(minAge);
  ageSet.add(maxAge);
  ageSet.add(Math.round((minAge + maxAge) / 2));
  if (user === 'provider' && minAge === 18 && maxAge === 150) {
    ageSet.add('all ages');
  }
  const genderSet = new Set();
  if (gender === 'all') {
    ['f', 'm', 'tm', 'tf'].forEach((item) => genderSet.add(item));
  } else {
    gender.split(',')
      .forEach((item) => genderSet.add(item));
  }
  const dataSet = [];
  for (const currentAge of ageSet) {
    for (const currentGender of genderSet) {
      dataSet.push({
        age: currentAge,
        gender: currentGender,
        text,
        test,
      });
    }
  }
  return dataSet;
}

const headingCache = {};

function expectedHeadings(age, gender, locale) {
  if (headingCache[`${age}${gender}${locale}`] !== undefined) {
    return headingCache[`${age}${gender}${locale}`];
  }
  // eslint-disable-next-line global-require,import/no-dynamic-require
  const topics = require(`../../../src/JSONFolder/HtmlTest-${locale.toUpperCase()}.json`);
  const expectedHeadingSet = new Set();
  for (const topic of topics) {
    if (((topic['Minimum age'] <= age && topic['Maximum age'] >= age) || age === 'all ages') && (topic.Gender.split(',')
      .includes(gender) || topic.Gender === 'all')) {
      expectedHeadingSet.add(topic.Test.replace(' ;', '\u00a0'));
    }
  }
  headingCache[`${age}${gender}${locale}`] = expectedHeadingSet;
  return expectedHeadingSet;
}

function testPageTestSteps(age, gender, text, test, user, locale) {
  const testPage = new TestPage();
  cookiesSetupAndAccessBodyPage(testPage, gender, age, user, locale);
  cy.getTestId('test')
    .click();
  testPage.assertHeadings(expectedHeadings(age, gender, locale), `${age}${gender}${locale}`);
  testPage.assertAndClickTest(test);
  let lines = text.split('\n');
  lines = lines.filter((line) => line.length > 0);
  lines.forEach(testPage.assertLineInDropdown);
}

export {
  generateTestDataSet,
  testPageTestSteps,
};
