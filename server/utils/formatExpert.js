export function formatExpert(profile) {
  const user = profile.user
  const photo = profile.profilePhoto || user?.avatar || ''
  return {
    _id: profile._id,
    userId: user?._id,
    name: user?.name,
    profilePhoto: photo,
    avatar: photo,
    bio: profile.bio,
    experience: profile.experience,
    languages: profile.languages || [],
    skills: profile.skills || [],
    hourlyPrice: profile.hourlyPrice,
    questionPrice: profile.questionPrice,
    pricePerQuestion: profile.questionPrice,
    completedAnswers: profile.completedAnswers,
    averageRating: profile.averageRating,
    totalRatings: profile.totalRatings,
    reviewCount: profile.totalRatings,
    responseTime: profile.responseTime,
    responseTimeHours: profile.responseTime,
    availability: profile.availability,
    isAvailable: profile.availability === 'available',
    videoCallAvailable: profile.videoCallAvailable ?? false,
    isVerified: profile.isVerified,
    status: profile.status,
    category: profile.category,
    expertType: profile.expertType,
    activeAssignments: profile.activeAssignments,
    maxAssignments: profile.maxAssignments,
  }
}
