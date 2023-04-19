import menus from './router';

const routers = [];

function getPath(list = []) {
    list.forEach(val => {
        // routers.push(val);
        routers.push({
            name: val.name,
            path: val.path,
            component: val.component,
            components: val.components
        });
        if (!val.hasChildren) {
            if (val.children && val.children.length > 0) {
                getPath(val.children);
            }
        }
    });
}

getPath(menus);

export default routers;


