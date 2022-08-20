import './css/styles.css';
import { Notify } from 'notiflix';
import { fetchCountries } from './fetchCountries';
import countryListMarkup from './templates/country-list.hbs'
import countryInfoMarkup from './templates/country-info.hbs'

const debounce = require('lodash.debounce');

const DEBOUNCE_DELAY = 300;

const refs = {
    searchBox: document.querySelector('#search-box'),
    countryList: document.querySelector('.country-list'),
    countryInfo: document.querySelector('.country-info'),
}

const showNotification = (status) => {
    if (status === 'info') {
        Notify.info("Too many matches found. Please enter a more specific name.");
    }
    if (status === 'failure') {
        Notify.failure("Oops, there is no country with that name")
    }
}

const createListMarkup = (arr) => {

    const markup = countryListMarkup(arr)
        
        
    //     arr.map(country => 
    //     `<li class="country-list__item">
    //         <img src=${country.flags.svg} alt="country-flag" width="35px" />
    //         <p>${country.name.common}</p>
    //     </li>`)
    //     .join('');    
    
    refs.countryList.innerHTML = markup;
}

const createCountryInfoMarkup = (country) => {
    refs.countryList.innerHTML = '';
    country = country[0];
    country.languages = Object.values(country.languages).join(',');

    const markup = countryInfoMarkup(country);
     
    refs.countryInfo.innerHTML = markup;
}

refs.searchBox.addEventListener('input', debounce((evt) => {
    if (evt.target.value.trim() === '') {
        refs.countryList.innerHTML = '';
        refs.countryInfo.innerHTML = '';
        return;
    }
    fetchCountries(evt.target.value.trim()).then(res => {
        if (res.status === 404) {
            refs.countryList.innerHTML = '';
            refs.countryInfo.innerHTML = '';
            showNotification('failure')
        };

        if (res.length > 10) {
            refs.countryList.innerHTML = '';
            refs.countryInfo.innerHTML = '';
            showNotification('info');
        }
        if (res.length > 1 && res.length <= 10) {
            refs.countryInfo.innerHTML = '';
            createListMarkup(res);
        }
        if (res.length === 1) {
            createCountryInfoMarkup(res);
        }
    })
        .catch(error => console.log(error))
}, DEBOUNCE_DELAY))

refs.countryList.addEventListener('click', (evt) => {
    fetchCountries(evt.target.textContent.trim()).then(res => {
        const exactCountry = res.filter(value => value.name.common === evt.target.textContent.trim())
        createCountryInfoMarkup(exactCountry);
    }).catch(error => console.log(error))
})