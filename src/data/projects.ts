export interface Project {
	id: string;
	title: string;
	description: string;
	image: string;
	category: "web" | "mobile" | "desktop" | "other";
	techStack: string[];
	status: "completed" | "in-progress" | "planned";
	liveDemo?: string;
	sourceCode?: string;
}

export const projectsData: Project[] = [
	{
		id: "mizuki-admin",
		title: "Mizuki Admin",
		description: "基于 Vue + FastAPI 的 Mizuki 博客管理系统，提供图形化界面管理博客内容，支持站点配置、文章、日记、番剧、友链、相册、技能、时间线、项目等功能的增删改查。",
		image: "",
		category: "web",
		techStack: ["Vue 3", "FastAPI", "Python", "Vite", "Axios"],
		status: "completed",
		sourceCode: "https://github.com/tuchayouji/Mizuki-Admin",
	},
];
