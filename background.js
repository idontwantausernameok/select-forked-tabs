//const temporary = browser.runtime.id.endsWith('@temporary-addon'); // debugging?
const manifest = browser.runtime.getManifest();
const extname = manifest.name;
const extdesc = manifest.description

function getChildren(id,tabs) {
	let children = new Set();
	for (const t of tabs){
		if(t.openerTabId === id) {
			children.add(t.id);
			const tmp =  getChildren(t.id,tabs);
			children = new Set([...children, ...tmp]);
		}
	}
	return children;
}

browser.menus.create({
	id: extname,
	title: extdesc,
	contexts: ["tab"],
	onclick: async function(info, tab) {
		if(info.menuItemId.startsWith(extname)){
			// close only visible tabs, which are forked from the one selected 
			const tabs = await browser.tabs.query({ 
				hidden: false 
			});
			const children = getChildren(tab.id, tabs);

			let tmp = {};

			//tmp[tab.windowId] = [tab.index];

			tabs.forEach( (t) => {
				if(children.has(t.id)){
					if (typeof tmp[t.windowId] === 'undefined'){
						tmp[t.windowId] = [];
					} 
					tmp[t.windowId].push(t.index);
				}
			});
			
			console.log(JSON.stringify(tmp,null,4));

			for (const [k,v] of Object.entries(tmp)) {
				browser.tabs.highlight({
					windowId: parseInt(k),
					tabs: v,
					populate: false
				}); 
			}


		}
	}
});

