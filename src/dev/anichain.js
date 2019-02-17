const sel = (target) => {
		const temp = [...document.querySelectorAll(target)];
		return temp.length !== 1 ? temp : temp[0];
	},
	crAr = (size, val = 0) => [...Array(size)].map(() => val),
	l = console.log.bind(console),
	lis = window.addEventListener,
	raf = requestAnimationFrame,
	gs = getComputedStyle;

class AnimEl extends null {
	constructor(element) {
		super();

		this.t = 0;

		const styles = {
			left: "x",
			top: "y",
			width: "w",
			height: "h",
			transform: "angle",
			display: "display",
		};

		Object.keys(styles).map((prop) => {
			Object.defineProperty(this, styles[prop], {
				get() {
					const style = gs(element)[prop];
					let res = style;
					if (style.includes("px")) res = parseInt(style);
					else if (prop === "transform") {
						const [a, b] = (style.match(/-?\d+\.?\d*/g) || crAr(2)).map((el) => +el);
						res = Math.round((Math.atan(b, a) * 180) / Math.PI);
					}
					return res;
				},
				set(val) {
					let res = val;
					const st = gs(element)[prop];
					if (st.includes("px")) res = `${val}px`;
					else if (prop === "transform") res = `rotate(${val}deg)`;
					element.style[prop] = res;
				},
			});
		});
	}

	animWrapper(action, args, cond) {
		return new Promise((resolve) => {
			const run = () => {
				if (cond()) {
					action(...args());
					++this.t;
					raf(run);
				} else resolve((this.t = 0));
			};
			run();
		});
	}
}

async function chain(...arr) {
	for (let i in arr) {
		const [item, itemNext] = [arr[i], arr[i + 1]];

		if (item instanceof Function) {
			item();
			break;
		}

		const [, obj, fun, arg, con] = item,
			aw = obj.animWrapper.bind(obj, fun.bind(obj), arg, con.bind(obj));
		item !== itemNext ? await aw() : aw();
	}
}

function init(arr) {
	arr = sel(arr);

	const create = (el) => {
		el.style.position = "absolute";
		return new AnimEl(el);
	};

	return arr.length ? arr.map((el) => create(el)) : create(el);
}

const [el, el2] = init("div");
l(el);

function move(dir = "x") {
	dir === "x" ? ++this.x : ++this.y;
}

const ch = () =>
	chain(
		[
			0,
			el,
			move,
			() => [],
			function() {
				return this.t < 100;
			},
		],
		[
			1,
			el,
			move,
			() => ["y"],
			function() {
				return this.t < 100;
			},
		],
		() => {
			el.x = 0;
			el.y = 200;
			ch();
		},
	);

ch();

export { l, sel, gs, lis, raf, crAr };