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

// The ≥10-votes team-split announcement, listing both generated teams. Hero/warrior tone,
// consistent with the reminder pools above (see decisions log #77 — this pool, plus
// NEED_DISCORD_LINK/EVENT_CANCELED/EVENT_CREATED below, were missed in the first retone pass).
export const TEAM_READY = [
  '🏆 Binh đoàn đã đủ quân! Hai đội chiến binh được chia như sau:\n{teams}',
  '⚔️ Đội hình chiến đấu đã hoàn tất — các anh hùng đã vào vị trí:\n{teams}',
  '🛡️ {count} chiến binh đã được chia thành hai đội quân:\n{teams}',
  '👑 Danh sách anh hùng cho trận chiến tuần này:\n{teams}',
  '🔥 Hai binh đoàn đã sẵn sàng đối đầu:\n{teams}',
  '🚩 Đội hình xung trận đã được chốt:\n{teams}',
  '🏆 Chiến binh đã tập hợp đủ {count} người, đội hình chia như sau:\n{teams}',
  '⚔️ Hai đội quân ngang tài ngang sức đã được lập:\n{teams}',
  '🛡️ Trận chiến sắp bắt đầu — đây là đội hình của bạn:\n{teams}',
  '👑 Các anh hùng đã được phân chia vào hai chiến tuyến:\n{teams}',
  '🔥 Đội hình chiến đấu đã lên, chuẩn bị xung trận:\n{teams}',
  '🚩 Binh đoàn đã được chia đều sức mạnh:\n{teams}',
  '🏆 {count} chiến binh, hai đội hình đáng gờm đã hình thành:\n{teams}',
  '⚔️ Đã đến giờ ra trận — đội hình như sau:\n{teams}',
  '🛡️ Hai chiến tuyến đã được thiết lập cho trận này:\n{teams}',
  '👑 Đội hình anh hùng đã sẵn sàng chiến đấu:\n{teams}',
  '🔥 Không cần chờ thêm, binh đoàn đã được chia xong:\n{teams}',
  '🚩 Đội quân của bạn đã được chỉ định:\n{teams}',
  '🏆 Chiến binh đã điểm danh đủ, đội hình chốt như sau:\n{teams}',
  '⚔️ Hai đội chiến binh ngang sức đã được lập ra:\n{teams}',
  '🛡️ Cân bằng lực lượng hoàn tất cho cả hai binh đoàn:\n{teams}',
  '👑 Vinh quang đang chờ — đội hình chiến đấu như sau:\n{teams}',
  '🔥 Đội hình đã được random ngẫu nhiên nhưng vẫn cân tài cân sức:\n{teams}',
  '🚩 Chiến trường đã chia phe, xem bạn thuộc đội nào:\n{teams}',
  '🏆 {count} anh hùng, hai đội quân đã sẵn sàng đối đầu:\n{teams}',
  '⚔️ Đội hình chiến đấu tuần này đã được ấn định:\n{teams}',
  '🛡️ Hai binh đoàn đã điểm danh đầy đủ:\n{teams}',
  '👑 Chiến binh nào cũng có phần trong trận này — đội hình:\n{teams}',
  '🔥 Sẵn sàng chưa chiến binh? Đội hình đã lên:\n{teams}',
  '🚩 Đội hình cho trận chiến sắp tới đã được chốt:\n{teams}'
]

// Some voters aren't linked to a roster Player yet — announced instead of TEAM_READY, and
// naming who needs linking. Stays mostly operational (this is a technical nudge, not hype),
// with a light hero-tone touch for consistency ("chiến binh"/"đội hình" instead of generic
// "người"/"team").
export const NEED_DISCORD_LINK = [
  '⚠️ {hosts} ơi, binh đoàn đã đủ {count} chiến binh nhưng chưa thể chia đội vì thiếu liên kết Discord cho: {names}. Cập nhật giúp nhé.',
  '⚠️ Đủ quân rồi, nhưng {names} chưa có hồ sơ chiến binh trên hệ thống. {hosts} cập nhật giúp để chia đội.',
  '⚠️ {hosts}, cần liên kết Discord ID cho {names} thì mới sắp xếp được đội hình. Giúp cập nhật sớm nhé!',
  '⚠️ Đã đủ {count} chiến binh, nhưng còn thiếu thông tin của {names}. {hosts} vào cập nhật giúp.',
  '⚠️ {hosts} ơi, {names} chưa có Discord ID trong hồ sơ nên chưa thể vào đội hình. Cập nhật giúp nhé.',
  '⚠️ Đủ {count} người tham chiến rồi, nhưng thiếu liên kết cho {names}. {hosts} bổ sung giúp để chia đội.',
  '⚠️ {hosts}, hệ thống cần Discord ID của {names} để sắp xếp đúng vị trí trong đội hình.',
  '⚠️ Sắp có đội hình rồi, chỉ còn thiếu liên kết hồ sơ cho {names}. {hosts} cập nhật giúp nhé.'
]

// A Host canceled the current event — rare, so a smaller pool is fine, same as
// NEED_DISCORD_LINK above. Posted to the channel and the event message is edited to remove
// the vote buttons (see discord-embeds.ts / events/current.delete.ts). "Retreat"/stand-down
// framing rather than hype, matching the mood of a canceled battle.
export const EVENT_CANCELED = [
  '🏳️ Trận chiến tuần này đã bị hủy. Binh đoàn rút quân, hẹn tái chiến tuần sau!',
  '🚩 Chiến dịch tuần này không diễn ra — lệnh xuất quân đã bị hủy bỏ.',
  '🏳️ Host đã hủy trận chiến tuần này. Cất vũ khí, chờ hồi kèn lần sau nhé.',
  '⚔️ Rất tiếc, trận chiến tuần này bị hủy giữa đường. Hẹn gặp lại chiến binh ở kèo sau.',
  '🚩 Sự kiện đã bị hủy bởi Host — không cần tập hợp binh đoàn nữa.',
  '🏳️ Chiến dịch tuần này tạm gác lại. Theo dõi kênh để biết ngày ra trận mới.'
]

// Posted right after a Host creates the week's event — a hype announcement distinct from
// the embed+buttons message itself (same pattern as vote-cast/removed getting their own
// message on top of the live-updating embed). Credits/tags *all* current Hosts — the
// website's shared-PIN create flow doesn't know which specific Host clicked the button, so
// rather than tag no one, every Host gets credited/pinged collectively. Hero/commander tone,
// matching HOST_REMINDER — a Host "declares battle," they don't just fill out a form.
export const EVENT_CREATED = [
  '⚔️ {hosts} đã tuyên chiến! Trận chiến tuần này diễn ra lúc {startsAt}. Chiến binh nào sẵn sàng thì vào vote: {link}',
  '📯 {hosts} vừa ra lệnh xuất quân — {startsAt}! Vào vote để gia nhập binh đoàn: {link}',
  '🚩 Cờ lệnh đã được giương cao! {hosts} công bố trận chiến lúc {startsAt}. Vote ngay: {link}',
  '🛡️ {hosts} đã triệu tập binh đoàn cho {startsAt}! Xung trận cùng nhau, vote tại: {link}',
  '⚔️ Chiến trường đã được mở ra bởi {hosts} — {startsAt}. Chiến binh vào vote ngay: {link}',
  '📯 Tướng quân {hosts} tuyên bố: trận chiến sẽ diễn ra lúc {startsAt}! Vote để tham chiến: {link}',
  '🔥 {hosts} đã thổi kèn xung trận cho {startsAt}! Đừng để binh đoàn thiếu bạn, vote ngay: {link}',
  '🚩 {hosts} chốt ngày ra trận: {startsAt}. Chiến binh nào cũng cần góp mặt, vote tại: {link}',
  '⚔️ Trận chiến tuần này đã được {hosts} ấn định — {startsAt}! Vào vote để nhập ngũ: {link}',
  '🛡️ {hosts} đã lên kế hoạch chiến đấu cho {startsAt}. Chiến binh tập hợp và vote nhé: {link}',
  '📯 Này chiến binh, {hosts} vừa công bố trận chiến lúc {startsAt}! Vote ngay: {link}',
  '🔥 {hosts} đã khai chiến cho tuần này — {startsAt}! Ai sẵn sàng ra trận thì vote: {link}',
  '🚩 Lệnh xuất quân đã ban: {hosts} ấn định {startsAt} là giờ chiến đấu. Vote tại: {link}',
  '⚔️ {hosts} vừa mở ra một trận chiến mới — {startsAt}. Hãy vote để cùng ra trận: {link}',
  '🛡️ Binh đoàn ơi, {hosts} đã chốt giờ xung trận: {startsAt}! Vào vote ngay: {link}',
  '📯 {hosts} tuyên bố chiến dịch tuần này bắt đầu lúc {startsAt}. Chiến binh vote để tham gia: {link}',
  '🔥 Ngọn lửa chiến tranh đã được {hosts} nhóm lên — {startsAt}! Vote ngay để không bị bỏ lại: {link}',
  '🚩 {hosts} đã cắm cờ báo hiệu trận chiến lúc {startsAt}. Chiến binh vào vote: {link}',
  '⚔️ Một trận chiến mới đã được {hosts} khởi xướng — {startsAt}! Xem chi tiết và vote: {link}',
  '🛡️ {hosts} đã sẵn sàng dẫn quân vào {startsAt}. Chiến binh nào theo cùng thì vote nhé: {link}',
  '📯 Này các chiến binh, {hosts} đã tuyên chiến cho {startsAt}! Đăng ký ra trận bằng cách vote: {link}',
  '🔥 {hosts} chốt trận đánh lớn vào {startsAt}! Vào vote để giành một chỗ trong binh đoàn: {link}',
  '🚩 {hosts} đã công bố thời điểm xung trận: {startsAt}. Vote ngay để không lỡ hẹn: {link}',
  '⚔️ Trống trận đã nổi lên nhờ {hosts} — {startsAt} là giờ ra quân! Vote tại: {link}',
  '🛡️ {hosts} đã chuẩn bị chiến trường cho {startsAt}. Chiến binh tập hợp, vote ngay: {link}'
]
