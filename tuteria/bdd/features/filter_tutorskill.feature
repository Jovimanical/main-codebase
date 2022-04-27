Feature: Filter users by interest
  As a standard user
  I want to filter users by their listed interests
  So I can find users who have similar interests to my own

  Background: There are interests and users in the system
    Given there are a number of interests:
      | interest        |
      | Django          |
      | Testing         |
      | Public Speaking |
      | DevOps          |
      | PHP             |

    And there are many users, each with different interests:
      | name          | interests               |
      | Billie Jean   | Django, Testing         |
      | Rocky Raccoon | Django, Public Speaking |
      | Major Tom     | Testing, Devops         |
      | Bobbie McGee  | Public Speaking, DevOps |

  Scenario Outline: Filter users
    Given I am a logged in user
    When I filter the list of users by <filter>
    Then I see <num> users

    Examples:
      | filter          | num |
      | Django          | 2   |
      | Django, Testing | 3   |
      | PHP             | 0   |