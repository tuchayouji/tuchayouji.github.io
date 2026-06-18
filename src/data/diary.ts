// 日记数据配置
export interface DiaryItem {
	id: number;
	content: string;
	date: string;
	images?: string[];
}

const diaryData: DiaryItem[] = [
	{
		id: 3,
		content: "今天做了个个人博客管理系统，大部分用AI写的，基于Vue和FastAPI，功能还挺齐全的",
		date: "2026-06-18T21:28:00+08:00"
	},
	{
		id: 2,
		content: "部署成功，域名也搞好了",
		date: "2026-06-17T22:05:51+08:00"
	},
	{
		id: 1,
		content: "博客创建成功！从今天开始记录生活~",
		date: "2026-06-16T17:00:00+08:00",
		images: ["/images/diary/sakura.jpg", "/images/diary/1.webp"]
	},
];

export const getDiaryList = (limit?: number) => {
	const sortedData = [...diaryData].sort(
		(a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
	);
	if (limit && limit > 0) return sortedData.slice(0, limit);
	return sortedData;
};

export const getAllTags = () => {
	const tags = new Set<string>();
	for (const item of diaryData) {
		if (item.tags) {
			for (const tag of item.tags) {
				tags.add(tag);
			}
		}
	}
	return Array.from(tags).sort();
};

export default diaryData;
