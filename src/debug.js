const div = document.getElementById('output');
const content = {};

export default function getLogger() {
    function log(name, text) {
        content[name] = text;
    }

    function print() {
        let html = '';
        for (let line of Object.getOwnPropertyNames(content)) {
            html += `<p>${line}: ${content[line]}</p>`;
        }
        div.innerHTML = html;
    }

    return {
        log,
        print
    };
}
