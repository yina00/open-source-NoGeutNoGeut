document.addEventListener('DOMContentLoaded', function() {
    const filterForm = document.getElementById('filterForm');

    function setHiddenValue(inputId, value) {
        document.getElementById(inputId).value = value;
    }

    document.getElementById('a').addEventListener('click', function(event) {
        event.preventDefault();
        toggleDropdown('a-dropdown');
    });

    function addRegionEventListeners(regionClass, dropdownId) {
        document.querySelectorAll(`.${regionClass}`).forEach(item => {
            item.addEventListener('click', function(event) {
                event.preventDefault();
                toggleSelectedItem(item);
                ensureDropdownVisible(dropdownId);
            });

            item.addEventListener('mouseover', function(event) {
                ensureDropdownVisible(dropdownId);
            });

            item.addEventListener('mouseleave', function(event) {
                hideDropdownWithDelay(dropdownId, regionClass);
            });
        });

        document.querySelectorAll(`#${dropdownId} .dropdown-child li a`).forEach(item => {
            item.addEventListener('click', function(event) {
                event.preventDefault();
                const city = item.textContent.trim();
                setHiddenValue('city', city);
                toggleSelectedItem(item);
                ensureDropdownVisible('b-dropdown');
            });
        });
    }

    addRegionEventListeners('a-seoul', 'seoul-dropdown');
    addRegionEventListeners('a-gyeonggi', 'gyeonggi-dropdown');
    addRegionEventListeners('a-busan', 'busan-dropdown');
    addRegionEventListeners('a-daegu', 'daegu-dropdown');
    addRegionEventListeners('a-daejeon', 'daejeon-dropdown');
    addRegionEventListeners('a-ulsan', 'ulsan-dropdown');
    addRegionEventListeners('a-sejong', 'sejong-dropdown');
    addRegionEventListeners('a-gangwon', 'gangwon-dropdown');
    addRegionEventListeners('a-chungbuk', 'chungbuk-dropdown');
    addRegionEventListeners('a-chungnam', 'chungnam-dropdown');
    addRegionEventListeners('a-jeonbuk', 'jeonbuk-dropdown');
    addRegionEventListeners('a-jeonnam', 'jeonnam-dropdown');
    addRegionEventListeners('a-gyeongbuk', 'gyeongbuk-dropdown');
    addRegionEventListeners('a-gyeongnam', 'gyeongnam-dropdown');
    addRegionEventListeners('a-jeju', 'jeju-dropdown');

    document.querySelectorAll('.b-item').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            const gender = item.textContent === '전체' ? '' : item.textContent;
            setHiddenValue('gender', gender);
            toggleSelectedItem(item);
            ensureDropdownVisible('c-dropdown');
        });
    });

    document.querySelectorAll('.c-item').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            const amount = item.textContent === '전체' ? '' :
                           item.textContent === '무료' ? '0' :
                           item.textContent === '1만원' ? '10000' :
                           item.textContent === '3만원' ? '30000' :
                           item.textContent === '5만원' ? '50000' : '';
            setHiddenValue('amount', amount);
            toggleSelectedItem(item);
            ensureDropdownVisible('f-dropdown');
        });
    });

    document.querySelectorAll('.f-item').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            const day = item.textContent === '전체' ? '' : item.textContent;
            setHiddenValue('day', day);
            toggleSelectedItem(item);
            ensureDropdownVisible('g-dropdown');
        });
    });

    document.querySelectorAll('.g-item').forEach(item => {
        item.addEventListener('click', function(event) {
            event.preventDefault();
            const time = item.textContent;
            setHiddenValue('time', time);
            toggleSelectedItem(item);
        });
    });

    function toggleDropdown(id) {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            dropdown.classList.toggle('show');
        }
    }

    function ensureDropdownVisible(id) {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            dropdown.classList.add('show');
        }
    }

    function hideDropdown(id) {
        const dropdown = document.getElementById(id);
        if (dropdown) {
            dropdown.classList.remove('show');
        }
    }

    function toggleSelectedItem(item) {
        item.classList.toggle('nav-selected');
    }

    function hideDropdownWithDelay(id, triggerClass) {
        setTimeout(() => {
            const dropdown = document.getElementById(id);
            const triggerElement = document.querySelector(`.${triggerClass}`);
            if (dropdown && triggerElement && !dropdown.matches(':hover') && !triggerElement.matches(':hover')) {
                dropdown.classList.remove('show');
            }
        }, 200);
    }

    document.getElementById('searchButton').addEventListener('click', function() {
        updateHiddenInputs();
        filterForm.submit();
    });

    function updateHiddenInputs() {
        document.getElementById('region').value = getSelectedText('a-item');
        document.getElementById('city').value = getSelectedText('seoul-item') || getSelectedText('gyeonggi-item');
        document.getElementById('gender').value = getSelectedText('b-item');
        document.getElementById('amount').value = getSelectedText('c-item');
        document.getElementById('day').value = getSelectedText('f-item');
        document.getElementById('time').value = getSelectedText('g-item');
    }

function getSelectedText(className) {
    const selectedItem = document.querySelector(`.${className}.nav-selected`);
    return selectedItem ? selectedItem.textContent.trim() : '';
}
});

