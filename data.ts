
import { Areas, EmployeeConfig } from './types';

export const INITIAL_EMPLOYEES: EmployeeConfig = {
    vegetables: ["张三", "李四", "王五"],
    grocery: ["赵六", "孙七"],
    seafood: ["周八"],
    meat: ["吴九", "郑十"],
    deli: ["刘一"],
    cashier: ["陈二", "林三"]
};

export const INITIAL_AREAS: Areas = {
    vegetables: {
        name: "蔬果区 (Vegetables & Fruits)",
        score: 0, maxScore: 0, completed: false, deductions: [],
        redLine: [
            "出现一次食品安全问题，如食物中毒或严重食品安全卫生投诉扣30分",
            "出现一次服务态度类型的客诉扣30分",
            "货架检查发现过期商品扣10分，前置仓库发现整箱的过期食品扣30分",
            "货架检查出现完全变质商品扣30分"
        ],
        items: [
            {
                name: "员工仪容仪表 (Staff Appearance)",
                standards: [
                    { name: "正确穿着工服 Correctly wear work clothes", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                    { name: "正确佩戴工牌 Wear your badge correctly", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                    { name: "个人卫生良好 Good personal hygiene", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                    { name: "加工人员正确佩戴帽子（发网）、口罩、手套 Processing personnel should wear hats (hair nets), masks and gloves correctly", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." }
                ]
            },
            {
                name: "现场服务态度 (Customer Service)",
                standards: [
                    { name: "主动问候顾客 Proactively greet customers", score: 3, maxScore: 3, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                    { name: "耐心解答问题 Answer questions patiently", score: 3, maxScore: 3, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." }
                ]
            },
            {
                name: "人员岗位分工 (Workstation Assignments)",
                standards: [
                    { name: "各岗位人员在岗 Staff at each post", score: 3, maxScore: 3, criteria: "全组1人缺岗不得分If one person in the group is absent, no points will be awarded" },
                    { name: "无行为散漫，聚众聊天 No lax behavior, no gathering and chatting", score: 2, maxScore: 2, criteria: "全组发现一例不得分If one case is found in the whole group, no points will be awarded" }
                ]
            },
            {
                name: "商品新鲜度 (Product Freshness)",
                standards: [
                    { name: "陈列位无腐烂和品质下降的商品 There are no rotten or deteriorating goods on display", score: 5, maxScore: 5, criteria: "≤1例不扣分，2-3例扣2.5分，≥4例不得分No deduction for ≤1 case, 2.5 points for 2-3 cases, no points for ≥4 cases" },
                    { name: "陈列条件符合保鲜要求 Display conditions meet preservation requirements", score: 4, maxScore: 4, criteria: "1例扣2分，≥2例不得分2 points will be deducted for 1 case, no points will be awarded for ≥ 2 cases" }
                ]
            },
            {
                name: "商品陈列 (Product Display)",
                standards: [
                    { name: "陈列整齐 Neatly displayed", score: 3, maxScore: 3, criteria: "≤1个排面不整齐不扣分，2个扣1.5分，≥3个不得分No point deduction for ≤1 irregular arrangement, 1.5 points deduction for 2 irregularities, no points for ≥3 irregularities" },
                    { name: "分类清晰 Clear classification", score: 2, maxScore: 2, criteria: "1个台面不清晰扣1分，≥2个不得分1 point will be deducted if one surface is not clear, no points will be awarded if ≥2 surfaces are not clear" },
                    { name: "补货及时 Timely replenishment", score: 3, maxScore: 3, criteria: "1个陈列面空缺超过20分钟不得分If a display surface is vacant for more than 20 minutes, no points will be awarded." }
                ]
            },
            {
                name: "价格标签 (Price Tag Accuracy)",
                standards: [
                    { name: "价格与系统一致 Price consistent with system", score: 3, maxScore: 3, criteria: "全组1-2个不合格扣1分，＞2人不合格不得分If 1-2 people in the group fail, 1 point will be deducted. If more than 2 people fail, no points will be awarded." },
                    { name: "标签清晰 Clear labeling", score: 2, maxScore: 2, criteria: "≤1例不扣分，2-3例扣1分，≥4例不得分No deduction for ≤1 case, 1 point deduction for 2-3 cases, no points for ≥4 cases" },
                    { name: "价格标签与商品对应 Price tags correspond to products", score: 3, maxScore: 3, criteria: "≤1例不扣分，2-3例扣1.5分，≥4例不得分No deduction for ≤1 case, 1.5 points for 2-3 cases, no points for ≥4 cases" },
                    { name: "价格标签放置在正确的位置 Price tags are placed in the correct place", score: 3, maxScore: 3, criteria: "≤1例不扣分，2-3例扣1.5分，≥4例不得分No deduction for ≤1 case, 1.5 points for 2-3 cases, no points for ≥4 cases" }
                ]
            },
            {
                name: "促销活动执行 (Promotion Execution)",
                standards: [
                    { name: "促销商品正确陈列 Proper display of promotional items", score: 2, maxScore: 2, criteria: "≥1个不准确不得分No points if ≥1 is inaccurate" },
                    { name: "宣传到位 Proper publicity", score: 2, maxScore: 2, criteria: "≥1个不合格不得分≥1 failure, no points" },
                    { name: "新品及时开单到货 New products arrive in time", score: 3, maxScore: 3, criteria: "凡出现新品没开单不得分If there is no order for new products, no points will be awarded." }
                ]
            },
            {
                name: "库存管理 (Inventory Management)",
                standards: [
                    { name: "叫货单准确 Accurate order", score: 2, maxScore: 2, criteria: "凡出现一次填写错误不得分No points will be awarded for any error in filling in the form." },
                    { name: "叫货量合理 Reasonable quantity", score: 3, maxScore: 3, criteria: "叫货量与实际误差≥±20%不得分（可协商）If the error between the ordered quantity and the actual quantity is ≥±20%, no points will be awarded (negotiable)" },
                    { name: "无因漏下单导致门店缺货 There is no shortage of stock in the store due to missed orders", score: 3, maxScore: 3, criteria: "凡出现一次填漏单断货不得分If there is a missing order or out of stock, no points will be awarded." },
                    { name: "无入库错误 No storage error", score: 2, maxScore: 2, criteria: "≥2次入库录入错误不得分No points will be awarded for ≥2 entry errors" }
                ]
            },
            {
                name: "卫生情况 (Hygiene)",
                standards: [
                    { name: "地面、墙面保持干净 Keep the floor and walls clean", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                    { name: "无垃圾和异味 No garbage and odor", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                ]
            },
            {
                name: "货架整理 (Shelf Organization)",
                standards: [
                    { name: "货架无破损 No damage to the shelf", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                    { name: "货架层面保持清洁 Keep the shelf level clean", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                ]
            },
            {
                name: "灯光照明 (Lighting)",
                standards: [
                    { name: "照明充足 Adequate lighting", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                    { name: "照明区域无偏差 No deviation in lighting area", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                    { name: "无灯泡损坏 No bulb damage", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                ]
            },
            {
                name: "温控设备 (Temperature Control)",
                standards: [
                    { name: "冷链设备正常运作（故障设备已报修） Cold chain equipment is operating normally", score: 2, maxScore: 2, criteria: "凡出现一次设备故障无保修不得分If there is a single equipment failure without warranty, no points will be awarded." },
                    { name: "设备内外保持清洁 Keep the equipment clean inside and outside", score: 3, maxScore: 3, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                    { name: "温度记录表完整登记 Temperature record sheet complete registration", score: 3, maxScore: 3, criteria: "≤1次未登记扣分，2-3次扣2分，≥4例不得分≤1 failure to register will result in deduction of points, 2-3 failures will result in 2 points, ≥4 failures will result in no points" }
                ]
            },
            {
                name: "先进先出 (FIFO Compliance)",
                standards: [
                    { name: "按先进先出原则管理库存 Manage inventory on a first-in, first-out basis", score: 3, maxScore: 3, criteria: "≤1例扣1.5分，≥2例不得分1.5 points will be deducted for ≤1 case, and no points will be awarded for ≥2 cases" }
                ]
            },
            {
                name: "前置仓 (Warehouse)",
                standards: [
                    { name: "地面墙面整洁 Clean floor and walls", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                    { name: "通道畅通 Smooth channel", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                    { name: "商品存放有明显分区 Goods are stored in clear areas", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" },
                    { name: "货架分区有明显标识 Shelf partitions are clearly marked", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" }
                ]
            }
        ]
    },
    grocery: {
        name: "食百区 (Food & Grocery)",
        score: 0, maxScore: 0, completed: false, deductions: [],
        redLine: [
            "出现一次食品安全问题，如食物中毒或严重食品安全卫生投诉扣30分",
            "出现一次服务态度类型的客诉扣30分",
            "货架检查发现过期商品扣10分，前置仓库发现整箱的过期食品扣30分",
            "货架检查出现完全变质商品扣30分"
        ],
        items: [
             { 
                    name: "员工仪容仪表 (Staff Appearance)", 
                    standards: [
                        { name: "正确穿着工服 Wear work clothes correctly", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "正确佩戴工牌 Wear your badge correctly", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "个人卫生良好 Good personal hygiene", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "现场服务态度 (Customer Service)", 
                    standards: [
                        { name: "主动问候顾客 Proactively greet customers", score: 3, maxScore: 3, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "耐心解答问题 Answer questions patiently", score: 3, maxScore: 3, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "人员岗位分工 (Workstation Assignments)", 
                    standards: [
                        { name: "各岗位人员在岗 Staff at each post", score: 3, maxScore: 3, criteria: "全组1人缺岗不得分If one person in the group is absent, no points will be awarded" },
                        { name: "卸货人员轻拿轻放 Unloading personnel should handle with care", score: 5, maxScore: 5, criteria: "发现1次扣2分，≥2次不得分2 points will be deducted for each discovery, no points will be awarded for ≥2 discoveries" },
                        { name: "无行为散漫，聚众聊天 No lax behavior, no gathering and chatting", score: 2, maxScore: 2, criteria: "全组发现一例不得分If one case is found in the whole group, no points will be awarded" }
                    ]
                },
                { 
                    name: "商品品质 (Product Freshness)", 
                    standards: [
                        { name: "陈列位无破包、胀包、漏包、包装内变质的商品 There are no broken, bulging, leaking or spoiled products on display.", score: 5, maxScore: 5, criteria: "≤1例不扣分，2-3例扣2.5分，≥4例不得分No deduction for ≤1 case, 2.5 points for 2-3 cases, no points for ≥4 cases" },
                        { name: "陈列条件符合商品储存要求 Display conditions meet product storage requirements", score: 4, maxScore: 4, criteria: "1例扣2分，≥2例不得分2 points will be deducted for 1 case, no points will be awarded for ≥ 2 cases" }
                    ]
                },
                { 
                    name: "商品陈列 (Product Display)", 
                    standards: [
                        { name: "陈列整齐 Neatly displayed", score: 3, maxScore: 3, criteria: "≤1个排面不整齐不扣分，2个扣1.5分，≥3个不得分No point deduction for ≤1 irregular arrangement, 1.5 points deduction for 2 irregularities, no points for ≥3 irregularities" },
                        { name: "分类清晰 Clear classification", score: 2, maxScore: 2, criteria: "1个台面不清晰扣1分，≥2个不得分1 point will be deducted if one surface is not clear, no points will be awarded if ≥2 surfaces are not clear" },
                        { name: "补货及时 Timely replenishment", score: 3, maxScore: 3, criteria: "1个陈列面空缺超过20分钟不得分If a display surface is vacant for more than 20 minutes, no points will be awarded." }
                    ]
                },
                { 
                    name: "价格标签 (Price Tag Accuracy)", 
                    standards: [
                        { name: "价格与系统一致 Price consistent with system", score: 3, maxScore: 3, criteria: "全组1-2个不合格扣1分，＞2人不合格不得分If 1-2 people in the group fail, 1 point will be deducted. If more than 2 people fail, no points will be awarded." },
                        { name: "标签清晰 Clear labeling", score: 2, maxScore: 2, criteria: "≤1例不扣分，2-3例扣1分，≥4例不得分No deduction for ≤1 case, 1 point deduction for 2-3 cases, no points for ≥4 cases" },
                        { name: "价格标签与商品对应 Price tags correspond to products", score: 3, maxScore: 3, criteria: "≤1例不扣分，2-3例扣1.5分，≥4例不得分No deduction for ≤1 case, 1.5 points for 2-3 cases, no points for ≥4 cases" },
                        { name: "价格标签放置在正确的位置 Price tags are placed in the correct place", score: 3, maxScore: 3, criteria: "≤1例不扣分，2-3例扣1.5分，≥4例不得分No deduction for ≤1 case, 1.5 points for 2-3 cases, no points for ≥4 cases" }
                    ]
                },
                { 
                    name: "促销活动执行 (Promotion Execution)", 
                    standards: [
                        { name: "促销商品正确陈列 Proper display of promotional items", score: 2, maxScore: 2, criteria: "≥1个不准确不得分No points if ≥1 is inaccurate" },
                        { name: "宣传到位 Proper publicity", score: 2, maxScore: 2, criteria: "≥1个不合格不得分≥1 failure, no points" },
                        { name: "新品及时开单到货 New products arrive in time", score: 3, maxScore: 3, criteria: "凡出现新品没开单不得分If there is no order for new products, no points will be awarded." }
                    ]
                },
                { 
                    name: "库存管理 (Inventory Management)", 
                    standards: [
                        { name: "叫货单准确 Accurate order", score: 2, maxScore: 2, criteria: "凡出现一次填写错误不得分No points will be awarded for any error in filling in the form." },
                        { name: "叫货量合理 Reasonable quantity", score: 3, maxScore: 3, criteria: "叫货量与实际误差≥±20%不得分（可协商）If the error between the ordered quantity and the actual quantity is ≥±20%, no points will be awarded (negotiable)" },
                        { name: "无因漏下单导致门店缺货 There is no shortage of stock in the store due to missed orders", score: 3, maxScore: 3, criteria: "凡出现一次填漏单断货不得分If there is a missing order or out of stock, no points will be awarded." },
                        { name: "无入库错误 No storage error", score: 2, maxScore: 2, criteria: "≥2次入库录入错误不得分No points will be awarded for ≥2 entry errors" }
                    ]
                },
                { 
                    name: "卫生情况 (Hygiene)", 
                    standards: [
                        { name: "地面、墙面保持干净 Keep the floor and walls clean", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "无垃圾和异味 No garbage and odor", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                    ]
                },
                { 
                    name: "货架整理 (Shelf Organization)", 
                    standards: [
                        { name: "货架无破损 No damage to the shelf", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "货架层面保持清洁 Keep the shelf level clean", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                    ]
                },
                { 
                    name: "灯光照明 (Lighting)", 
                    standards: [
                        { name: "照明充足 Adequate lighting", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "照明区域无偏差 No deviation in lighting area", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "无灯泡损坏 No bulb damage", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                    ]
                },
                { 
                    name: "温控设备 (Temperature Control)", 
                    standards: [
                        { name: "冷链设备正常运作（故障设备已报修） Cold chain equipment is operating normally", score: 2, maxScore: 2, criteria: "凡出现一次设备故障无保修不得分If there is a single equipment failure without warranty, no points will be awarded." },
                        { name: "设备内外保持清洁 Keep the equipment clean inside and outside", score: 3, maxScore: 3, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "温度记录表完整登记 Temperature record sheet complete registration", score: 3, maxScore: 3, criteria: "≤1次未登记扣分，2-3次扣2分，≥4例不得分≤1 failure to register will result in deduction of points, 2-3 failures will result in 2 points, ≥4 failures will result in no points" }
                    ]
                },
                { 
                    name: "先进先出 (FIFO Compliance)", 
                    standards: [
                        { name: "按先进先出原则管理库存 Manage inventory on a first-in, first-out basis", score: 3, maxScore: 3, criteria: "≤1例扣1.5分，≥2例不得分1.5 points will be deducted for ≤1 case, and no points will be awarded for ≥2 cases" }
                    ]
                },
                { 
                    name: "前置仓 (Warehouse)", 
                    standards: [
                        { name: "地面墙面整洁 Clean floor and walls", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "通道畅通 Smooth channel", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "商品存放有明显分区 Goods are stored in clear areas", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" },
                        { name: "货架分区有明显标识 Shelf partitions are clearly marked", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" }
                    ]
                }
        ]
    },
    seafood: {
        name: "水产区 (SeaFood)",
        score: 0, maxScore: 0, completed: false, deductions: [],
        redLine: [
            "出现一次食品安全问题，如食物中毒或严重食品安全卫生投诉扣30分",
            "出现一次服务态度类型的客诉扣30分",
            "货架检查发现过期商品扣10分，前置仓库发现整箱的过期食品扣30分",
            "货架检查出现完全变质商品扣30分"
        ],
        items: [
            { 
                    name: "员工仪容仪表 (Staff Appearance)", 
                    standards: [
                        { name: "正确穿着工服 Wear work clothes correctly", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "正确佩戴工牌 Wear your badge correctly", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "个人卫生良好 Good personal hygiene", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "全组人员正确佩戴帽子（发网）、口罩、手套 All team members wear hats (hair nets), masks and gloves correctly", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "现场服务态度 (Customer Service)", 
                    standards: [
                        { name: "主动问候顾客 Proactively greet customers", score: 3, maxScore: 3, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "耐心解答问题 Answer questions patiently", score: 3, maxScore: 3, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "人员岗位分工 (Workstation Assignments)", 
                    standards: [
                        { name: "各岗位人员在岗 Staff at each post", score: 3, maxScore: 3, criteria: "全组1人缺岗不得分If one person in the group is absent, no points will be awarded" },
                        { name: "无行为散漫，聚众聊天 No lax behavior, no gathering and chatting", score: 2, maxScore: 2, criteria: "全组发现一例不得分If one case is found in the whole group, no points will be awarded" }
                    ]
                },
                { 
                    name: "商品品质 (Product Freshness)", 
                    standards: [
                        { name: "活鲜养殖缸内没有死亡的鱼类贝类 There are no dead fish or shellfish in the live aquaculture tank", score: 5, maxScore: 5, criteria: "≤1例不扣分，2例扣3分，3例不得分No deduction for ≤1 case, 3 points for 2 cases, no points for 3 cases" },
                        { name: "养殖缸水质干净 Clean water in the breeding tank", score: 4, maxScore: 4, criteria: "≤1例不扣分，2例扣3分，3例不得分No deduction for ≤1 case, 3 points for 2 cases, no points for 3 cases" }
                    ]
                },
                { 
                    name: "商品陈列 (Product Display)", 
                    standards: [
                        { name: "陈列整齐 Neatly displayed", score: 3, maxScore: 3, criteria: "≤1个排面不整齐不扣分，2个扣1.5分，≥3个不得分No point deduction for ≤1 irregular arrangement, 1.5 points deduction for 2 irregularities, no points for ≥3 irregularities" },
                        { name: "分类清晰 Clear classification", score: 2, maxScore: 2, criteria: "1个台面不清晰扣1分，≥2个不得分1 point will be deducted if one surface is not clear, no points will be awarded if ≥2 surfaces are not clear" },
                        { name: "补货及时 Timely replenishment", score: 3, maxScore: 3, criteria: "1个陈列面空缺超过20分钟不得分If a display surface is vacant for more than 20 minutes, no points will be awarded." }
                    ]
                },
                { 
                    name: "价格标签 (Price Tag Accuracy)", 
                    standards: [
                        { name: "价格与系统一致 Price consistent with system", score: 3, maxScore: 3, criteria: "全组1-2个不合格扣1分，＞2人不合格不得分If 1-2 people in the group fail, 1 point will be deducted. If more than 2 people fail, no points will be awarded." },
                        { name: "标签清晰 Clear labeling", score: 2, maxScore: 2, criteria: "≤1例不扣分，2-3例扣1分，≥4例不得分No deduction for ≤1 case, 1 point deduction for 2-3 cases, no points for ≥4 cases" },
                        { name: "价格标签与商品对应 Price tags correspond to products", score: 3, maxScore: 3, criteria: "≤1例不扣分，2-3例扣1.5分，≥4例不得分No deduction for ≤1 case, 1.5 points for 2-3 cases, no points for ≥4 cases" },
                        { name: "价格标签放置在正确的位置 Price tags are placed in the correct place", score: 3, maxScore: 3, criteria: "≤1例不扣分，2-3例扣1.5分，≥4例不得分No deduction for ≤1 case, 1.5 points for 2-3 cases, no points for ≥4 cases" }
                    ]
                },
                { 
                    name: "促销活动执行 (Promotion Execution)", 
                    standards: [
                        { name: "促销商品正确陈列 Proper display of promotional items", score: 2, maxScore: 2, criteria: "≥1个不准确不得分No points if ≥1 is inaccurate" },
                        { name: "宣传到位 Proper publicity", score: 2, maxScore: 2, criteria: "≥1个不合格不得分≥1 failure, no points" },
                        { name: "新品及时开单到货 New products arrive in time", score: 3, maxScore: 3, criteria: "凡出现新品没开单不得分If there is no order for new products, no points will be awarded." }
                    ]
                },
                { 
                    name: "库存管理 (Inventory Management)", 
                    standards: [
                        { name: "叫货单准确 Accurate order", score: 2, maxScore: 2, criteria: "凡出现一次填写错误不得分No points will be awarded for any error in filling in the form." },
                        { name: "叫货量合理 Reasonable quantity", score: 3, maxScore: 3, criteria: "叫货量与实际误差≥±20%不得分（可协商）If the error between the ordered quantity and the actual quantity is ≥±20%, no points will be awarded (negotiable)" },
                        { name: "无因漏下单导致门店缺货 There is no shortage of stock in the store due to missed orders", score: 3, maxScore: 3, criteria: "凡出现一次填漏单断货不得分If there is a missing order or out of stock, no points will be awarded." },
                        { name: "无入库错误 No storage error", score: 2, maxScore: 2, criteria: "≥2次入库录入错误不得分No points will be awarded for ≥2 entry errors" }
                    ]
                },
                { 
                    name: "卫生情况 (Hygiene)", 
                    standards: [
                        { name: "地面、墙面保持干净 Keep the floor and walls clean", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "无垃圾和异味 No garbage and odor", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                    ]
                },
                { 
                    name: "冰台整理 (Shelf Organization)", 
                    standards: [
                        { name: "冰台表面整洁 Ice table surface is clean", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "冰台厚度合规 Ice table thickness compliance", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                    ]
                },
                { 
                    name: "灯光照明 (Lighting)", 
                    standards: [
                        { name: "照明充足 Adequate lighting", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "照明区域无偏差 No deviation in lighting area", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "无灯泡损坏 No bulb damage", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                    ]
                },
                { 
                    name: "温控设备 (Temperature Control)", 
                    standards: [
                        { name: "冷链设备正常运作（故障设备已报修） Cold chain equipment is operating normally", score: 2, maxScore: 2, criteria: "凡出现一次设备故障无保修不得分If there is a single equipment failure without warranty, no points will be awarded." },
                        { name: "设备内外保持清洁 Keep the equipment clean inside and outside", score: 3, maxScore: 3, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "温度记录表完整登记 Temperature record sheet complete registration", score: 3, maxScore: 3, criteria: "≤1次未登记扣分，2-3次扣2分，≥4例不得分≤1 failure to register will result in deduction of points, 2-3 failures will result in 2 points, ≥4 failures will result in no points" }
                    ]
                },
                { 
                    name: "先进先出 (FIFO Compliance)", 
                    standards: [
                        { name: "按先进先出原则管理库存 Manage inventory on a first-in, first-out basis", score: 3, maxScore: 3, criteria: "≤1例扣1.5分，≥2例不得分1.5 points will be deducted for ≤1 case, and no points will be awarded for ≥2 cases" }
                    ]
                },
                { 
                    name: "加工区域 (Processing Area)", 
                    standards: [
                        { name: "加工台面保持清洁 Keep the processing surface clean", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "加工用具摆放合规 Processing tools are placed in compliance with regulations", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "加工用具保持清洁 Keep processing tools clean", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" },
                        { name: "垃圾桶套袋带盖 Trash can bag with lid", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" }
                    ]
                }
        ]
    },
    meat: {
        name: "肉品区 (Meat)",
        score: 0, maxScore: 0, completed: false, deductions: [],
        redLine: [
            "出现一次食品安全问题，如食物中毒或严重食品安全卫生投诉扣30分",
            "出现一次服务态度类型的客诉扣30分",
            "货架检查发现过期商品扣10分，前置仓库发现整箱的过期食品扣30分",
            "货架检查出现完全变质商品扣30分"
        ],
        items: [
            { 
                    name: "员工仪容仪表 (Staff Appearance)", 
                    standards: [
                        { name: "正确穿着工服 Wear work clothes correctly", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "正确佩戴工牌 Wear your badge correctly", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "个人卫生良好 Good personal hygiene", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "全组人员正确佩戴帽子（发网）、口罩、手套 All team members wear hats (hair nets), masks and gloves correctly", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "现场服务态度 (Customer Service)", 
                    standards: [
                        { name: "主动问候顾客 Proactively greet customers", score: 3, maxScore: 3, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "耐心解答问题 Answer questions patiently", score: 3, maxScore: 3, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "人员岗位分工 (Workstation Assignments)", 
                    standards: [
                        { name: "各岗位人员在岗 Staff at each post", score: 3, maxScore: 3, criteria: "全组1人缺岗不得分If one person in the group is absent, no points will be awarded" },
                        { name: "无行为散漫，聚众聊天 No lax behavior, no gathering and chatting", score: 2, maxScore: 2, criteria: "全组发现一例不得分If one case is found in the whole group, no points will be awarded" }
                    ]
                },
                { 
                    name: "商品品质 (Product Freshness)", 
                    standards: [
                        { name: "陈列商品无变色、变味 The displayed products have no discoloration or odor change", score: 5, maxScore: 5, criteria: "≤1例不扣分，2例扣3分，3例不得分No deduction for ≤1 case, 3 points for 2 cases, no points for 3 cases" },
                        { name: "陈列商品无血水溢出 No blood or water spillage on displayed merchandise", score: 2, maxScore: 2, criteria: "1例扣1分，≥2例不得分1 point will be deducted for each case, no points will be awarded for ≥2 cases" },
                        { name: "称重价格签日期均为当天日期 The weighing price is signed on the same day.", score: 4, maxScore: 4, criteria: "1例扣1分，2例扣2分，3例不得分1 point will be deducted for 1 case, 2 points will be deducted for 2 cases, and no points will be awarded for 3 cases" }
                    ]
                },
                { 
                    name: "商品陈列 (Product Display)", 
                    standards: [
                        { name: "陈列整齐 Neatly displayed", score: 3, maxScore: 3, criteria: "≤1个排面不整齐不扣分，2个扣1.5分，≥3个不得分No point deduction for ≤1 irregular arrangement, 1.5 points deduction for 2 irregularities, no points for ≥3 irregularities" },
                        { name: "分类清晰 Clear classification", score: 2, maxScore: 2, criteria: "1个台面不清晰扣1分，≥2个不得分1 point will be deducted if one surface is not clear, no points will be awarded if ≥2 surfaces are not clear" },
                        { name: "补货及时 Timely replenishment", score: 3, maxScore: 3, criteria: "1个陈列面空缺超过20分钟不得分If a display surface is vacant for more than 20 minutes, no points will be awarded." }
                    ]
                },
                { 
                    name: "价格标签 (Price Tag Accuracy)", 
                    standards: [
                        { name: "价格与系统一致 Price consistent with system", score: 3, maxScore: 3, criteria: "全组1-2个不合格扣1分，＞2人不合格不得分If 1-2 people in the group fail, 1 point will be deducted. If more than 2 people fail, no points will be awarded." },
                        { name: "标签清晰 Clear labeling", score: 2, maxScore: 2, criteria: "≤1例不扣分，2-3例扣1分，≥4例不得分No deduction for ≤1 case, 1 point deduction for 2-3 cases, no points for ≥4 cases" },
                        { name: "价格标签与商品对应 Price tags correspond to products", score: 3, maxScore: 3, criteria: "≤1例不扣分，2-3例扣1.5分，≥4例不得分No deduction for ≤1 case, 1.5 points for 2-3 cases, no points for ≥4 cases" },
                        { name: "价格标签放置在正确的位置 Price tags are placed in the correct place", score: 3, maxScore: 3, criteria: "≤1例不扣分，2-3例扣1.5分，≥4例不得分No deduction for ≤1 case, 1.5 points for 2-3 cases, no points for ≥4 cases" }
                    ]
                },
                { 
                    name: "促销活动执行 (Promotion Execution)", 
                    standards: [
                        { name: "促销商品正确陈列 Proper display of promotional items", score: 2, maxScore: 2, criteria: "≥1个不准确不得分No points if ≥1 is inaccurate" },
                        { name: "宣传到位 Proper publicity", score: 2, maxScore: 2, criteria: "≥1个不合格不得分≥1 failure, no points" },
                        { name: "新品及时开单到货 New products arrive in time", score: 3, maxScore: 3, criteria: "凡出现新品没开单不得分If there is no order for new products, no points will be awarded." }
                    ]
                },
                { 
                    name: "库存管理 (Inventory Management)", 
                    standards: [
                        { name: "叫货单准确 Accurate order", score: 2, maxScore: 2, criteria: "凡出现一次填写错误不得分No points will be awarded for any error in filling in the form." },
                        { name: "叫货量合理 Reasonable quantity", score: 3, maxScore: 3, criteria: "叫货量与实际误差≥±20%不得分（可协商）If the error between the ordered quantity and the actual quantity is ≥±20%, no points will be awarded (negotiable)" },
                        { name: "无因漏下单导致门店缺货 There is no shortage of stock in the store due to missed orders", score: 3, maxScore: 3, criteria: "凡出现一次填漏单断货不得分If there is a missing order or out of stock, no points will be awarded." },
                        { name: "无入库错误 No storage error", score: 2, maxScore: 2, criteria: "≥2次入库录入错误不得分No points will be awarded for ≥2 entry errors" }
                    ]
                },
                { 
                    name: "卫生情况 (Hygiene)", 
                    standards: [
                        { name: "地面、墙面保持干净 Keep the floor and walls clean", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "无垃圾和异味 No garbage and odor", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                    ]
                },
                { 
                    name: "灯光照明 (Lighting)", 
                    standards: [
                        { name: "照明充足，照明色彩合理 Adequate lighting and reasonable lighting colors", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "照明区域无偏差 No deviation in lighting area", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "无灯泡损坏 No bulb damage", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                    ]
                },
                { 
                    name: "温控设备 (Temperature Control)", 
                    standards: [
                        { name: "冷链设备正常运作（故障设备已报修） Cold chain equipment is operating normally", score: 2, maxScore: 2, criteria: "凡出现一次设备故障无保修不得分If there is a single equipment failure without warranty, no points will be awarded." },
                        { name: "设备内外保持清洁 Keep the equipment clean inside and outside", score: 3, maxScore: 3, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "温度记录表完整登记 Temperature record sheet complete registration", score: 3, maxScore: 3, criteria: "≤1次未登记扣分，2-3次扣2分，≥4例不得分≤1 failure to register will result in deduction of points, 2-3 failures will result in 2 points, ≥4 failures will result in no points" }
                    ]
                },
                { 
                    name: "先进先出 (FIFO Compliance)", 
                    standards: [
                        { name: "按先进先出原则管理库存 Manage inventory on a first-in, first-out basis", score: 3, maxScore: 3, criteria: "≤1例扣1.5分，≥2例不得分1.5 points will be deducted for ≤1 case, and no points will be awarded for ≥2 cases" }
                    ]
                },
                { 
                    name: "加工区域 (Processing Area)", 
                    standards: [
                        { name: "加工台面保持清洁 Keep the processing surface clean", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "加工用具摆放合规 Processing tools are placed in compliance with regulations", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "加工用具保持清洁 Keep processing tools clean", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" },
                        { name: "加工设备内外保持清洁 Keep processing equipment clean inside and outside", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" },
                        { name: "垃圾桶套袋带盖 Trash can bag with lid", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" }
                    ]
                }
        ]
    },
    deli: {
        name: "熟食区 (Deli)",
        score: 0, maxScore: 0, completed: false, deductions: [],
        redLine: [
            "出现一次食品安全问题，如食物中毒或严重食品安全卫生投诉扣30分",
            "出现一次服务态度类型的客诉扣30分",
            "货架检查发现过期商品扣10分，前置仓库发现整箱的过期食品扣30分",
            "货架检查出现完全变质商品扣30分"
        ],
        items: [
             { 
                    name: "员工仪容仪表 (Staff Appearance)", 
                    standards: [
                        { name: "正确穿着工服 Wear work clothes correctly", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "正确佩戴工牌 Wear your badge correctly", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "个人卫生良好 Good personal hygiene", score: 2, maxScore: 2, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "全组人员正确佩戴帽子（发网）、口罩、手套 All team members wear hats (hair nets), masks and gloves correctly", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "现场服务态度 (Customer Service)", 
                    standards: [
                        { name: "主动问候顾客 Proactively greet customers", score: 3, maxScore: 3, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "耐心解答问题 Answer questions patiently", score: 3, maxScore: 3, criteria: "全组1-2人不合格扣1分，≥3人不合格不得分If 1-2 people in the group fail, 1 point will be deducted; if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "人员岗位分工 (Workstation Assignments)", 
                    standards: [
                        { name: "各岗位人员在岗 Staff at each post", score: 3, maxScore: 3, criteria: "全组1人缺岗不得分If one person in the group is absent, no points will be awarded" },
                        { name: "无行为散漫，聚众聊天 No lax behavior, no gathering and chatting", score: 2, maxScore: 2, criteria: "全组发现一例不得分If one case is found in the whole group, no points will be awarded" }
                    ]
                },
                { 
                    name: "商品品质 (Product Freshness)", 
                    standards: [
                        { name: "陈列商品符合食品安全标准 Displayed products meet food safety standards", score: 5, maxScore: 5, criteria: "≤1例不扣分，2例扣3分，3例不得分No deduction for ≤1 case, 3 points for 2 cases, no points for 3 cases" },
                        { name: "原材料品质符合标准 Raw material quality meets standards", score: 2, maxScore: 2, criteria: "1例扣1分，≥2例不得分1 point will be deducted for each case, no points will be awarded for ≥2 cases" },
                        { name: "原材料卫生标准合规 Raw materials comply with hygiene standards", score: 4, maxScore: 4, criteria: "1例扣1分，2例扣2分，3例不得分1 point will be deducted for 1 case, 2 points will be deducted for 2 cases, and no points will be awarded for 3 cases" }
                    ]
                },
                { 
                    name: "商品陈列 (Product Display)", 
                    standards: [
                        { name: "陈列整齐 Neatly displayed", score: 3, maxScore: 3, criteria: "≤1个排面不整齐不扣分，2个扣1.5分，≥3个不得分No point deduction for ≤1 irregular arrangement, 1.5 points deduction for 2 irregularities, no points for ≥3 irregularities" },
                        { name: "分类清晰 Clear classification", score: 2, maxScore: 2, criteria: "1个台面不清晰扣1分，≥2个不得分1 point will be deducted if one surface is not clear, no points will be awarded if ≥2 surfaces are not clear" },
                        { name: "补货及时 Timely replenishment", score: 3, maxScore: 3, criteria: "1个陈列面空缺超过20分钟不得分If a display surface is vacant for more than 20 minutes, no points will be awarded." }
                    ]
                },
                { 
                    name: "价格标签 (Price Tag Accuracy)", 
                    standards: [
                        { name: "价格与系统一致 Price consistent with system", score: 3, maxScore: 3, criteria: "全组1-2个不合格扣1分，＞2人不合格不得分If 1-2 people in the group fail, 1 point will be deducted. If more than 2 people fail, no points will be awarded." },
                        { name: "标签清晰 Clear labeling", score: 2, maxScore: 2, criteria: "≤1例不扣分，2-3例扣1分，≥4例不得分No deduction for ≤1 case, 1 point deduction for 2-3 cases, no points for ≥4 cases" },
                        { name: "价格标签与商品对应 Price tags correspond to products", score: 3, maxScore: 3, criteria: "≤1例不扣分，2-3例扣1.5分，≥4例不得分No deduction for ≤1 case, 1.5 points for 2-3 cases, no points for ≥4 cases" },
                        { name: "价格标签放置在正确的位置 Price tags are placed in the correct place", score: 3, maxScore: 3, criteria: "≤1例不扣分，2-3例扣1.5分，≥4例不得分No deduction for ≤1 case, 1.5 points for 2-3 cases, no points for ≥4 cases" }
                    ]
                },
                { 
                    name: "促销活动执行 (Promotion Execution)", 
                    standards: [
                        { name: "促销商品正确陈列 Proper display of promotional items", score: 2, maxScore: 2, criteria: "≥1个不准确不得分No points if ≥1 is inaccurate" },
                        { name: "宣传到位 Proper publicity", score: 2, maxScore: 2, criteria: "≥1个不合格不得分≥1 failure, no points" },
                        { name: "新品及时开单到货 New products arrive in time", score: 3, maxScore: 3, criteria: "凡出现新品没开单不得分If there is no order for new products, no points will be awarded." }
                    ]
                },
                { 
                    name: "库存管理 (Inventory Management)", 
                    standards: [
                        { name: "叫货单准确 Accurate order", score: 2, maxScore: 2, criteria: "凡出现一次填写错误不得分No points will be awarded for any error in filling in the form." },
                        { name: "叫货量合理 Reasonable quantity", score: 3, maxScore: 3, criteria: "叫货量与实际误差≥±20%不得分（可协商）If the error between the ordered quantity and the actual quantity is ≥±20%, no points will be awarded (negotiable)" },
                        { name: "无因漏下单导致门店缺货 There is no shortage of stock in the store due to missed orders", score: 3, maxScore: 3, criteria: "凡出现一次填漏单断货不得分If there is a missing order or out of stock, no points will be awarded." },
                        { name: "无入库错误 No storage error", score: 2, maxScore: 2, criteria: "≥2次入库录入错误不得分No points will be awarded for ≥2 entry errors" }
                    ]
                },
                { 
                    name: "卫生情况 (Hygiene)", 
                    standards: [
                        { name: "地面、墙面保持干净 Keep the floor and walls clean", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "无垃圾和异味 No garbage and odor", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                    ]
                },
                { 
                    name: "灯光照明 (Lighting)", 
                    standards: [
                        { name: "照明充足，照明色彩合理 Adequate lighting and reasonable lighting colors", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "照明区域无偏差 No deviation in lighting area", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "无灯泡损坏 No bulb damage", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" }
                    ]
                },
                { 
                    name: "设备 (Equipment)", 
                    standards: [
                        { name: "加热、冷链设备正常运作（故障设备已报修） Heating and cold chain equipment are operating normally", score: 2, maxScore: 2, criteria: "凡出现一次设备故障无保修不得分If there is a single equipment failure without warranty, no points will be awarded." },
                        { name: "设备内外保持清洁 Keep the equipment clean inside and outside", score: 3, maxScore: 3, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "温度记录表完整登记 Temperature record sheet complete registration", score: 3, maxScore: 3, criteria: "≤1次未登记扣分，2-3次扣2分，≥4例不得分≤1 failure to register will result in deduction of points, 2-3 failures will result in 2 points, ≥4 failures will result in no points" }
                    ]
                },
                { 
                    name: "先进先出 (FIFO Compliance)", 
                    standards: [
                        { name: "按先进先出原则管理库存 Manage inventory on a first-in, first-out basis", score: 3, maxScore: 3, criteria: "≤1例扣1.5分，≥2例不得分1.5 points will be deducted for ≤1 case, and no points will be awarded for ≥2 cases" }
                    ]
                },
                { 
                    name: "加工区域 (Processing Area)", 
                    standards: [
                        { name: "加工台面保持清洁 Keep the processing surface clean", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "加工用具摆放合规 Processing tools are placed in compliance with regulations", score: 2, maxScore: 2, criteria: "≥2处不合格不得分No points will be awarded if ≥2 items are unqualified" },
                        { name: "加工用具保持清洁 Keep processing tools clean", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" },
                        { name: "加工设备内外保持清洁 Keep processing equipment clean inside and outside", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" },
                        { name: "垃圾桶套袋带盖 Trash can bag with lid", score: 2, maxScore: 2, criteria: "不满足不得分No points if not satisfied" }
                    ]
                }
        ]
    },
    cashier: {
        name: "收银区域 (Cashier)",
        score: 0, maxScore: 0, completed: false, deductions: [],
        redLine: [
            "出现一次故意盗用公款全组扣30分，涉事人员开除处理。",
            "出现一次服务态度类型的客诉全组扣30分",
            "出现一次擅自修改或盗用会员积分换取奖励全组扣30分，涉事人员记大过1次。",
            "出现一次故意少收/多收款事件全组扣30分，涉事人员开除处理。"
        ],
        items: [
             { 
                    name: "员工仪容仪表 (Staff Appearance)", 
                    standards: [
                        { name: "正确穿着工服 Wear work clothes correctly", score: 4, maxScore: 4, criteria: "全组1-2人不合格扣2分，≥3人不合格不得分If 1-2 people in the group fail, 2 points will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "佩戴工牌 Wear your badge", score: 4, maxScore: 4, criteria: "全组1-2人不合格扣2分，≥3人不合格不得分If 1-2 people in the group fail, 2 points will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "发型，装扮合规 Hair style, dress compliance", score: 4, maxScore: 4, criteria: "全组1-2人不合格扣2分，≥3人不合格不得分If 1-2 people in the group fail, 2 points will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "个人卫生良好 Good personal hygiene", score: 4, maxScore: 4, criteria: "全组1-2人不合格扣2分，≥3人不合格不得分If 1-2 people in the group fail, 2 points will be deducted; if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "现场服务态度 (Customer Service)", 
                    standards: [
                        { name: "主动问候顾客 Proactively greet customers", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." },
                        { name: "语气友好，有耐心 Friendly tone and patient", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." },
                        { name: "面带微笑 Smiling Face", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." },
                        { name: "正确使用礼貌用语 Use polite language correctly", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "收银流程规范 (Cashier Procedure Compliance)", 
                    standards: [
                        { name: "按流程操作收银机 Operate the cash register according to the process", score: 4, maxScore: 4, criteria: "全组1-2人不合格扣2分，≥3人不合格不得分If 1-2 people in the group fail, 2 points will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "确保商品扫描准确无误 Ensure product scans are accurate", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." },
                        { name: "关注商品和称重价格签是否匹配 Pay attention to whether the product and the weighing price tag match", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." },
                        { name: "正确处理会员积分 Correctly handle membership points", score: 4, maxScore: 4, criteria: "全组1-2人不合格扣2分，≥3人不合格不得分If 1-2 people in the group fail, 2 points will be deducted; if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "货币找零准确性 (Cash Handling Accuracy)", 
                    standards: [
                        { name: "找零金额正确 Correct change amount", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." },
                        { name: "向顾客清晰报出消费金额和找零金额 Clearly inform customers of the amount spent and the amount of change", score: 5, maxScore: 5, criteria: "全组1-2人不合格扣2.5分，≥3人不合格不得分If 1-2 people in the group fail, 2.5 points will be deducted, and if ≥3 people fail, no points will be awarded." },
                        { name: "识别假币，正确使用验钞机 Identify counterfeit money and use the currency detector correctly", score: 4, maxScore: 4, criteria: "全组1-2人不合格扣2分，≥3人不合格不得分If 1-2 people in the group fail, 2 points will be deducted; if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "设备清洁与维护 (Equipment Cleanliness & Maintenance)", 
                    standards: [
                        { name: "收银机、扫码枪、POS机正常运作 Cash registers, barcode scanners, and POS machines are operating normally", score: 4, maxScore: 4, criteria: "全组1-2人不合格扣2分，≥3人不合格不得分If 1-2 people in the group fail, 2 points will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "设备表面干净无灰尘 The equipment surface is clean and dust-free", score: 4, maxScore: 4, criteria: "全组1-2人不合格扣2分，≥3人不合格不得分If 1-2 people in the group fail, 2 points will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "及时更换收银纸及POS机纸 Replace cash register paper and POS machine paper in time", score: 4, maxScore: 4, criteria: "全组1-2人不合格扣2分，≥3人不合格不得分If 1-2 people in the group fail, 2 points will be deducted; if ≥3 people fail, no points will be awarded." }
                    ]
                },
                { 
                    name: "收银区域环境 (Cashier Area Environment)", 
                    standards: [
                        { name: "收银台整洁，无杂物堆积 The cash register is clean and tidy, without any clutter", score: 4, maxScore: 4, criteria: "全组1-2人不合格扣2分，≥3人不合格不得分If 1-2 people in the group fail, 2 points will be deducted; if ≥3 people fail, no points will be awarded." },
                        { name: "顾客通道畅通，无障碍物 Customer access is unobstructed", score: 3, maxScore: 3, criteria: "1例扣1分，≥2例不得分1 point will be deducted for each case, no points will be awarded for ≥2 cases" },
                        { name: "地面干净无污渍 The floor is clean and stain-free", score: 3, maxScore: 3, criteria: "1例扣1分，≥2例不得分1 point will be deducted for each case, no points will be awarded for ≥2 cases" }
                    ]
                },
                { 
                    name: "防损与安全 (Loss Prevention & Security)", 
                    standards: [
                        { name: "妥善保管现金 Keep your cash safe", score: 5, maxScore: 5, criteria: "1例扣2.5分，≥2例不得分2.5 points will be deducted for 1 case, no points will be awarded for ≥ 2 cases" },
                        { name: "按规定处理异常交易（如退款、作废等） Handle abnormal transactions according to regulations (such as refunds, cancellations, etc.)", score: 5, maxScore: 5, criteria: "凡出现一次操作错误不得分No points will be awarded for any operational error." }
                    ]
                }
        ]
    }
};
