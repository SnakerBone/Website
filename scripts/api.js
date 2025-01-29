export function enableDropdownLogic() 
{
    const elements = document.getElementsByClassName('info-collapse-title');

    for (let i = 0; i < elements.length; i++) {
        const element = elements[i];

        element.addEventListener('click', () =>
        {
            element.classList.toggle('info-active');

            const holder = element.nextElementSibling;
            const footer = document.getElementById('transforming-footer');

            let suffix;

            if (holder.style.maxHeight.length != 0) {
                holder.style.maxHeight = '';
                suffix = '+';

                if (footer) {
                    footer.removeAttribute('hidden');
                }
            } else {
                holder.style.maxHeight = holder.scrollHeight + 'px';
                suffix = '-';

                if (footer) {
                    footer.setAttribute('hidden', 'true');
                }
            }

            const suffixElement = element.children[0].children[0];

            suffixElement.textContent = suffix;
        });
    }
}