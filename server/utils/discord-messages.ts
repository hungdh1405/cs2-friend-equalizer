// Vietnamese-language template pools for the Discord bot's own channel messages — distinct
// from server/utils/changelog-messages.ts, which is the English-language admin/audit feed
// shown on the website's /changelog page. Placeholders are substituted by
// server/utils/discord-notify.ts using the same `{key}` syntax as changelog.ts's `render()`.
// Picked pseudo-randomly per message so the channel doesn't read like a repetitive bot log.

// Mentions all current Hosts, reminds them to schedule this week's event. Hero/commander
// framing per explicit request ("fighting tones, fighter tones, heroes tones") — a Host is
// the one who "declares battle"/rallies the squad, not just an admin creating a form entry.
export const HOST_REMINDER = [
  '📯 {hosts} ơi, chiến trường tuần này vẫn chưa được khai mở. Hãy tuyên chiến giúp anh em: {link}',
  '⚔️ Chỉ huy {hosts}, binh đoàn đang chờ lệnh xuất quân cho tuần này: {link}',
  '🛡️ {hosts} ơi, chưa có trận chiến nào được lên kế hoạch tuần này. Triệu tập binh đoàn nhé: {link}',
  '📯 Tướng quân {hosts}, đã đến lúc tuyên bố trận chiến tuần này rồi: {link}',
  '🚩 {hosts}, cả binh đoàn đang ngóng lệnh xung trận. Tạo kèo giúp mọi người: {link}',
  '⚔️ Chưa có tiếng kèn xung trận nào tuần này. {hosts} hãy khởi động cuộc chiến: {link}',
  '🛡️ {hosts} ơi, chiến binh đang chờ chỉ huy ra lệnh tập hợp: {link}',
  '📯 Này {hosts}, tuần mới đã đến mà chưa có trận chiến nào được công bố: {link}',
  '🚩 {hosts}, hãy cầm cờ lệnh và mở ra trận chiến cho tuần này: {link}',
  '⚔️ Binh đoàn vẫn đang chờ đợi. {hosts} tuyên chiến giúp anh em nhé: {link}',
  '🛡️ {hosts} ơi, không có chỉ huy ra lệnh thì chiến binh không biết đánh ở đâu: {link}',
  '📯 Nhắc nhẹ chỉ huy {hosts}: kèo tuần này vẫn chưa được khai màn: {link}',
  '🚩 {hosts}, thời điểm xuất quân đang đến gần mà chưa có lệnh nào: {link}',
  '⚔️ Này tướng quân {hosts}, binh đoàn đang chờ bạn tuyên bố ngày giờ chiến đấu: {link}',
  '🛡️ {hosts} ơi, hãy triệu tập chiến binh cho trận đấu tuần này: {link}',
  '📯 Không có lệnh xuất quân, binh đoàn không thể lên đường. {hosts} tạo kèo giúp: {link}',
  '🚩 {hosts}, cả server đang chờ tiếng kèn trận chiến tuần này: {link}',
  '⚔️ Chỉ huy {hosts} ơi, đã đến lúc vẽ ra chiến trường cho tuần này: {link}',
  '🛡️ {hosts}, binh đoàn cần một chỉ huy ra lệnh — tạo sự kiện giúp nhé: {link}',
  '📯 Này {hosts}, mỗi ngày trôi qua là một ngày binh đoàn chưa được triệu tập: {link}',
  '🚩 {hosts} ơi, hãy giương cao ngọn cờ và công bố trận chiến tuần này: {link}',
  '⚔️ Tướng quân {hosts}, thời cơ xuất quân đang chờ lệnh của bạn: {link}',
  '🛡️ {hosts}, chiến binh đang sẵn sàng — chỉ cần bạn ra lệnh tập hợp: {link}',
  '📯 Nhắc {hosts} lần nữa: chưa có trận chiến nào được lên kế hoạch tuần này: {link}',
  '🚩 {hosts} ơi, hãy là người khơi mào cho trận chiến tuần này: {link}',
  '⚔️ Không có kèo thì không có chiến thắng. {hosts} tuyên chiến giúp mọi người: {link}',
  '🛡️ {hosts}, đã đến giờ triệu hồi binh đoàn cho tuần này rồi: {link}',
  '📯 Này chỉ huy {hosts}, chiến trường vẫn im ắng vì chưa có lệnh xuất quân: {link}',
  '🚩 {hosts} ơi, hãy thổi kèn tập hợp chiến binh cho trận đấu tuần này: {link}',
  '⚔️ {hosts}, một chỉ huy giỏi không để binh đoàn chờ đợi lâu — tạo kèo ngay: {link}'
]

// Vote reminders (3x/day) — hero/warrior tone per explicit request, and now the *only*
// recurring channel presence besides the pinned event message itself (per-vote Yes/No
// messages were removed — team feedback that they made the channel too messy; the pinned
// message's own live edit already shows who's in). Every template links to /event ("inform
// the link to see more") since there's no per-vote message to carry that detail anymore.
// URGENT/CLOSE include {mentions} — the specific roster players (linked to a Discord account)
// who haven't voted or declined yet, tagged directly so the reminder reaches exactly who
// still needs to act, never the whole server. If nobody's left to tag, discord-notify.ts
// renders {mentions} as an empty string and sends with allowed_mentions: { parse: [] }.
export const VOTE_REMINDER_URGENT = [
  '⚔️ Chiến trường đang thiếu quân! Mới có {count} chiến binh, cần thêm {remaining} nữa. {mentions} tập hợp ngay: {link}',
  '🛡️ Đội quân chưa đủ sức mạnh để xung trận — thiếu {remaining} người. {mentions} hãy cầm vũ khí lên: {link}',
  '🔥 Tổng động viên! Chỉ mới {count} chiến binh trình diện, cần thêm {remaining} anh hùng nữa: {link}',
  '🚩 Trận chiến tuần này cần thêm {remaining} chiến binh mới đủ quân số. {mentions} đừng để đồng đội đơn độc: {link}',
  '💥 Báo động! Kèo có nguy cơ tan vì thiếu {remaining} người. {mentions} xung trận giúp anh em: {link}',
  '🛡️ Chỉ huy cần thêm {remaining} chiến binh để hoàn thành binh đoàn. {mentions} tham gia ngay: {link}',
  '⚔️ {mentions}, chiến trường đang chờ các bạn — còn thiếu {remaining} suất mới đủ quân: {link}',
  '🔥 Mới {count} người xung phong, còn thiếu {remaining} nữa mới đủ đội hình chiến đấu: {link}',
  '🚩 Kèo này cần một binh đoàn hoàn chỉnh — hiện tại thiếu {remaining} chiến binh. {mentions} vào trận: {link}',
  '💪 {mentions} ơi, đồng đội đang chờ các bạn ra trận. Còn thiếu {remaining} suất: {link}',
  '⚔️ Không có các bạn, trận này khó mà xung trận được. Thiếu {remaining} chiến binh: {link}',
  '🛡️ Liên minh cần thêm sức mạnh — {remaining} chiến binh nữa là đủ quân. {mentions} tham gia: {link}',
  '🔥 Chiến hữu ơi, hàng ngũ vẫn còn trống {remaining} vị trí. {mentions} xin mời nhập trận: {link}',
  '🚩 Tổng cộng mới {count} chiến binh — cần {remaining} anh hùng nữa để ra trận: {link}',
  '💥 {mentions}, quân đoàn đang réo gọi tên bạn. Còn thiếu {remaining} suất mới đủ sức chiến đấu: {link}',
  '⚔️ Trận chiến sắp mất quân số vì thiếu {remaining} người. {mentions} đừng chậm trễ: {link}',
  '🛡️ Cần thêm {remaining} tay súng để hoàn thiện đội hình chiến đấu. {mentions} tham gia ngay: {link}',
  '🔥 Vinh quang đang chờ, nhưng đội hình còn thiếu {remaining} người. {mentions} xung trận: {link}',
  '🚩 {mentions} ơi, đây là lời kêu gọi tập hợp — còn thiếu {remaining} chiến binh: {link}',
  '💪 Một trận chiến lớn cần một đội quân đông đủ. Hiện thiếu {remaining} người. {mentions} góp sức: {link}'
]

export const VOTE_REMINDER_CLOSE = [
  '⚔️ Gần đủ quân rồi! Chỉ còn thiếu {remaining} chiến binh nữa. {mentions} chốt đội hình luôn: {link}',
  '🛡️ Binh đoàn sắp hoàn chỉnh — còn {remaining} suất cuối cùng. {mentions} nhanh tay: {link}',
  '🔥 Chiến thắng đang rất gần, chỉ thiếu {remaining} người nữa thôi! {mentions} vào trận: {link}',
  '🚩 Sắp đủ quân số cho trận chiến! Còn {remaining} vị trí trống. {mentions} lấp đầy đi: {link}',
  '💥 {mentions}, đội quân chỉ còn thiếu {remaining} anh hùng nữa là hoàn chỉnh: {link}',
  '🛡️ Gần chốt đội hình rồi, thiếu đúng {remaining} chiến binh cuối. {mentions} đừng bỏ lỡ: {link}',
  '⚔️ Chặng cuối của cuộc tập hợp — chỉ cần {remaining} người nữa! {mentions} xung trận: {link}',
  '🔥 {count} chiến binh đã sẵn sàng, chỉ thiếu {remaining} nữa là đủ binh đoàn: {link}',
  '🚩 Vinh quang đang vẫy gọi — còn {remaining} suất là đội hình hoàn thiện. {mentions} vào ngay: {link}',
  '💪 Sắp đủ sức mạnh để xung trận, chỉ thiếu {remaining} chiến binh: {link}',
  '🛡️ {mentions}, các bạn là mảnh ghép cuối cùng — chỉ còn thiếu {remaining} người: {link}',
  '⚔️ Đội quân đã gần hoàn chỉnh, còn {remaining} vị trí đang chờ anh hùng: {link}',
  '🔥 Chỉ cần thêm {remaining} chiến binh, trận chiến này chắc chắn diễn ra! {mentions}: {link}',
  '🚩 {mentions} ơi, đừng để binh đoàn thiếu {remaining} người vào giờ chót: {link}',
  '💥 Gần full quân số rồi! Thiếu {remaining} suất cuối để hoàn thiện đội hình: {link}',
  '🛡️ Chiến thắng chỉ còn cách {remaining} chiến binh nữa. {mentions} chốt luôn: {link}',
  '⚔️ {mentions}, hãy là anh hùng lấp đầy {remaining} suất còn thiếu: {link}',
  '🔥 Đội hình chiến đấu sắp hoàn chỉnh, chỉ thiếu {remaining} người: {link}',
  '🚩 Cơ hội cuối để gia nhập binh đoàn — còn {remaining} suất trống: {link}',
  '💪 {mentions}, chỉ còn {remaining} bước nữa là đội quân sẵn sàng ra trận: {link}'
]

export const VOTE_REMINDER_ENOUGH = [
  '🏆 Binh đoàn đã tập hợp đủ {count} chiến binh! Ai muốn gia nhập thêm vẫn luôn được chào đón: {link}',
  '👑 Đội quân đã sẵn sàng ra trận với {count} chiến binh! Xem danh sách tại: {link}',
  '⚔️ Đủ quân số rồi, chiến thắng đang chờ phía trước! Chi tiết: {link}',
  '🛡️ {count} chiến binh đã tập hợp — trận chiến này chắc chắn diễn ra! Xem thêm: {link}',
  '🔥 Đội hình hoàn chỉnh với {count} tay súng! Chuẩn bị tinh thần xung trận: {link}',
  '🚩 Binh đoàn đã đủ sức mạnh để chiến đấu! Ai vào thêm vẫn được hoan nghênh: {link}',
  '🏆 Vinh quang đang gọi tên — {count} chiến binh đã có mặt! Chi tiết tại: {link}',
  '👑 Đội quân {count} người đã tập hợp xong, chỉ còn chờ ngày ra trận: {link}',
  '⚔️ Đủ chiến binh rồi! Trận chiến tuần này chính thức được xác nhận: {link}',
  '🛡️ {count} anh hùng đã sẵn sàng — không còn gì phải lo lắng nữa: {link}',
  '🔥 Binh đoàn đã full quân số! Ai muốn góp mặt thêm vẫn luôn có chỗ: {link}',
  '🚩 Đội hình chiến đấu đã hoàn thiện với {count} chiến binh. Xem tại: {link}',
  '🏆 Chiến thắng đã trong tầm tay với {count} tay súng sẵn sàng! Chi tiết: {link}',
  '👑 Quân đoàn đã tập hợp đầy đủ, giờ chỉ còn chờ hồi kèn xung trận: {link}',
  '⚔️ {count} chiến binh đã điểm danh — đội hình chính thức chốt! Xem thêm: {link}',
  '🛡️ Đủ người cho trận chiến này rồi, cảm ơn tất cả chiến binh đã tham gia: {link}',
  '🔥 Binh đoàn hùng mạnh với {count} người đã sẵn sàng ra trận: {link}',
  '🚩 Đội quân đã đủ sức mạnh, chiến trường đang chờ đón các anh hùng: {link}',
  '🏆 {count} chiến binh, một đội hình đáng gờm đã hình thành! Chi tiết: {link}',
  '👑 Trận chiến tuần này đã có đủ quân, giờ chỉ còn đếm ngày xung trận: {link}'
]

// The ≥10-votes team-split announcement, listing both generated teams.
export const TEAM_READY = [
  '🎉 Đã đủ người tham gia! Team đã được chia ngẫu nhiên, sẵn sàng chiến thôi:\n{teams}',
  '🏆 Full slot rồi! Đây là đội hình được chia cho trận này:\n{teams}',
  '🎮 Đủ người rồi anh em! Hai team đã lên sẵn:\n{teams}',
  '🔥 Kèo đã đủ, chia team xong luôn! Xem đội hình:\n{teams}',
  '🎉 Chốt đội hình cho trận tuần này:\n{teams}',
  '🏆 Team đã sẵn sàng, chuẩn bị vào trận:\n{teams}',
  '🎮 Đã đủ {count} người, hai team được chia như sau:\n{teams}',
  '🔥 Danh sách team đã có, không cần chờ thêm nữa:\n{teams}',
  '🎉 Trận này chính thức đủ người, đội hình như sau:\n{teams}',
  '🏆 Đội hình ngẫu nhiên cho trận tuần này đã lên:\n{teams}',
  '🎮 Full team rồi, chia đội xong xuôi:\n{teams}',
  '🔥 Anh em xem đội hình được chia cho kèo này nhé:\n{teams}',
  '🎉 Đủ người, đủ đội, chỉ còn chờ ngày đấu:\n{teams}',
  '🏆 Team đã chốt, giờ chỉ cần chiến thắng thôi:\n{teams}',
  '🎮 Đội hình đã sẵn sàng cho trận đấu tuần này:\n{teams}',
  '🔥 Chia team xong, ai cũng có phần trong trận này:\n{teams}',
  '🎉 Team được chia tự động, công bằng cho cả hai bên:\n{teams}',
  '🏆 Đây là hai đội cho trận đấu sắp tới:\n{teams}',
  '🎮 Sẵn sàng chưa? Team đã lên, chờ gì mà không luyện tay:\n{teams}',
  '🔥 Đủ người tham gia, đội hình được chốt như sau:\n{teams}',
  '🎉 Không cần chờ thêm, đội hình chính thức đã có:\n{teams}',
  '🏆 Trận đấu tuần này đã có đủ hai team so kè:\n{teams}',
  '🎮 Chia đội xong, giờ chỉ còn đếm ngày ra trận:\n{teams}',
  '🔥 Cân bằng lực lượng đã hoàn tất cho cả hai bên:\n{teams}',
  '🎉 Đội hình được xáo trộn ngẫu nhiên nhưng vẫn cân tài cân sức:\n{teams}',
  '🏆 Team A và Team B đã điểm danh đầy đủ:\n{teams}',
  '🎮 Đủ 2 đội cho trận cầu tuần này, xem ai chung team với ai:\n{teams}',
  '🔥 Không khí chiến đấu đã lên, đội hình đã chốt:\n{teams}',
  '🎉 Random đội hình xong, giờ chỉ còn thi đấu hết mình:\n{teams}',
  '🏆 Hai team ngang tài ngang sức đã được lập:\n{teams}'
]

// Some voters aren't linked to a roster Player yet — announced instead of TEAM_READY, and
// naming who needs linking.
export const NEED_DISCORD_LINK = [
  '⚠️ {hosts} ơi, đã đủ {count} người tham gia nhưng chưa thể chia team vì còn thiếu liên kết Discord cho: {names}. Vào trang quản lý cập nhật giúp nhé.',
  '⚠️ Đủ người rồi, nhưng {names} chưa được liên kết với hồ sơ trên hệ thống. {hosts} cập nhật giúp để chia team nhé.',
  '⚠️ {hosts}, cần liên kết Discord ID cho {names} thì mới chia được đội hình. Giúp cập nhật sớm nhé!',
  '⚠️ Đã đủ số lượng tham gia, nhưng còn thiếu thông tin của {names} trên hệ thống. {hosts} vào cập nhật giúp.',
  '⚠️ {hosts} ơi, {names} chưa có Discord ID trong hồ sơ nên chưa random được team. Cập nhật giúp nhé.',
  '⚠️ Đủ {count} người tham gia rồi, nhưng thiếu liên kết cho {names}. {hosts} bổ sung giúp để chia đội.',
  '⚠️ {hosts}, hệ thống cần Discord ID của {names} để tính đúng trình khi chia team.',
  '⚠️ Sắp có team rồi, chỉ còn thiếu liên kết hồ sơ cho {names}. {hosts} cập nhật giúp nhé.'
]

// A Host canceled the current event — rare, so a smaller pool is fine, same as
// NEED_DISCORD_LINK above. Posted to the channel and the event message is edited to remove
// the vote buttons (see discord-embeds.ts / events/current.delete.ts).
export const EVENT_CANCELED = [
  '📢 Sự kiện tuần này đã bị hủy. Hẹn mọi người vào tuần sau nhé!',
  '❌ Kèo tuần này không diễn ra — sự kiện đã bị hủy.',
  '📢 Đã hủy sự kiện tuần này. Theo dõi kênh để biết lịch mới nhé.',
  '❌ Rất tiếc, trận tuần này bị hủy. Hẹn gặp lại ở kèo sau.',
  '📢 Sự kiện đã được hủy bởi Host. Không cần vote nữa nhé.',
  '❌ Kèo tuần này đã dừng lại giữa đường. Chờ thông báo mới.'
]

// Posted right after a Host creates the week's event — a hype announcement distinct from
// the embed+buttons message itself (same pattern as vote-cast/removed getting their own
// message on top of the live-updating embed). Credits/tags *all* current Hosts — the
// website's shared-PIN create flow doesn't know which specific Host clicked the button, so
// rather than tag no one, every Host gets credited/pinged collectively.
export const EVENT_CREATED = [
  '🎉 {hosts} đã lên kèo tuần này: {startsAt}! Vào vote ngay: {link}',
  '📅 {hosts} vừa tạo sự kiện mới cho tuần này — {startsAt}. Vào vote nhé: {link}',
  '🔥 {hosts} chốt kèo rồi! Trận tuần này diễn ra lúc {startsAt}. Bấm nút vote ở trên nhé.',
  '📢 {hosts} vừa tạo sự kiện tuần này: {startsAt}. Xem chi tiết và vote tại: {link}',
  '🎮 {hosts} đã setup kèo mới — {startsAt}. Đừng quên vote nha anh em!',
  '📅 {hosts} lên lịch cho tuần này rồi: {startsAt}. Ai đi được thì tham gia sớm nhé.',
  '🔥 {hosts} chốt giờ đấu tuần này: {startsAt}! Vote ngay ở tin nhắn phía trên.',
  '🎉 Cảm ơn {hosts} đã tạo kèo! {startsAt}. Xem thêm và xác nhận tham gia tại: {link}',
  '📢 {hosts} thông báo: sự kiện tuần này sẽ diễn ra vào {startsAt}. Vào vote thôi!',
  '🎮 {hosts} đã có lịch tuần này: {startsAt}. Ai chưa vote thì tranh thủ nhé.',
  '🔥 {hosts} setup kèo cho {startsAt} rồi. Chờ gì mà chưa vote?',
  '📅 {hosts} vừa tạo sự kiện mới: {startsAt}. Chi tiết đầy đủ tại: {link}',
  '🎉 {hosts} đã chốt kèo — {startsAt}! Ai tham gia thì lên tiếng nhé.',
  '📢 {hosts} vừa lên lịch cho tuần này, diễn ra lúc {startsAt}.',
  '🎮 {hosts} đã setup kèo tuần này: {startsAt}. Vote ngay để không bị quên!',
  '🔥 {hosts} hẹn mọi người vào {startsAt} — sự kiện đã được tạo, vote thôi!',
  '📅 {hosts} vừa lên lịch trận tuần này: {startsAt}. Xem ai đã tham gia tại: {link}',
  '🎉 {hosts} vừa chốt xong lịch — {startsAt}! Nhanh tay vote để giữ chỗ.',
  '📢 {hosts} thông báo kèo tuần này chính thức lên sóng vào {startsAt}.',
  '🎮 {hosts} đã có lịch chơi tuần này: {startsAt}. Xác nhận tham gia ở nút phía trên nhé.',
  '🔥 {hosts} báo tin: trận tuần này diễn ra lúc {startsAt} — đừng bỏ lỡ, vote ngay!',
  '📅 {hosts} đã lên kế hoạch cho tuần này: {startsAt}. Chi tiết tại: {link}',
  '🎉 {hosts} vừa tạo kèo ngon: {startsAt}. Vào vote để chốt số lượng nhé!',
  '📢 Cập nhật từ {hosts}: sự kiện tuần này sẽ bắt đầu lúc {startsAt}.',
  '🎮 {hosts} lên lịch xong rồi — {startsAt}! Ai tham gia thì bấm nút vote nhé.'
]
